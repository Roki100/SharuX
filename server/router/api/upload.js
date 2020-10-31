/*
    Upload api endpoint
*/

// Custom Shit
const config = require('../../../config.json');
const util = require('../../../util/util.js');
const db = require('../../../util/db.js');
const logger = require('../../../util/logger.js');
const MAP = require('../../../util/functionMap');

// Required libs
const { existsSync, mkdirSync } = require('fs');
const { resolve } = require('path');

// Router
const { Router } = require('express');
const router = Router();

// Middleware
const fileUpload = require('express-fileupload');

router.use(fileUpload({
    safeFileNames: true, // Strips weird characters from file names
    preserveExtension: 10, // Supports file extensions of upto all characters (.torrent)
    useTempFiles: true, // Important option - removes the possiblity of out-of-memory crash from a large uploads
    tempFileDir: resolve(__dirname + '../../../../tmp/'),
    limits: {
        fileSize: config.maxFileSize || Infinity, // Max file size in bytes
    },
    abortOnLimit: true
}));


router.post('/api/upload', async (req, res) => {
    // Errors
    if (!await db.available()) return res.status(500).json({ "success": false, "message": "Internal server error - DataBase unreachable." });
    let token = req.headers.token;
    if (!token || token.length !== 69) return res.status(403).json({ "success": false, "message": "No token was provided." });
    let userInfo = await db.getUserInfo(token);
    if (!userInfo) return res.status(403).json({ "success": false, "message": "Wrong token was provided." });
    if (!req.files || !req.files.file) return res.status(400).json({ "success": false, "message": "No file was provided." });

    // Extension functions
    let fileNameArray = req.files.file.name.split('.');
    let fileExtention = fileNameArray[fileNameArray.length - 1];

    let fileFunction = MAP.get(fileExtention);
    if (fileFunction !== undefined) await fileFunction(req.files.file);

    // Request configuration
    let logic = req.headers.urllogic == 'zws' ? 'zws' : 'standard';
    let length = req.headers.urllength > 200 ? 200 : req.headers.urllength < 15 ? 15 : req.headers.urllength || 15;
    let urlString = util.characterLogic(logic, length);
    let durability = config.durabilityHeader == true ? (req.headers.mode == undefined ? config.db.durability : (req.headers.mode == 'safe') ? 'hard' : (req.headers.mode == 'fast') ? 'soft' : 'hard') : config.db.durability;

    // Folder & path generation
    let date = new Date()
    let year = util.addZero(date.getFullYear());
    let month = util.addZero(date.getMonth() + 1);
    let day = util.addZero(date.getDate());

    // There is probably a better way to do this, blame MILLION for shit code:
    if (!existsSync(__dirname + `../../../../uploads/${userInfo.name}`)) mkdirSync(__dirname + `../../../../uploads/${userInfo.name}`);
    if (!existsSync(__dirname + `../../../../uploads/${userInfo.name}/${year}`)) mkdirSync(__dirname + `../../../../uploads/${userInfo.name}/${year}`);
    if (!existsSync(__dirname + `../../../../uploads/${userInfo.name}/${year}/${month}`)) mkdirSync(__dirname + `../../../../uploads/${userInfo.name}/${year}/${month}`);
    if (!existsSync(__dirname + `../../../../uploads/${userInfo.name}/${year}/${month}/${day}`)) mkdirSync(__dirname + `../../../../uploads/${userInfo.name}/${year}/${month}/${day}`);

    let filePath = util.createFilePath(`uploads/${userInfo.name}/${year}/${month}/${day}/${req.files.file.name}`.replace('_', '-'));
    let fullFilePath = resolve(__dirname + '../../../../' + filePath);

    req.files.file.mv(fullFilePath, async (err) => {
        if (err) {
            res.status(500).json({ "success": false, "message": "Internal server error while trying to move the file." });
            return logger.error(`Cannot move file ${req.files.file.name} to ${fullFilePath} - upload for user ${token}\n${err}`); // change to username later
        }

        let dbObject = {
            name: encodeURIComponent(urlString),
            path: '/' + filePath,
            uploaderName: userInfo.name,
            uploaderID: userInfo.id,
            views: 0,
            originalName: req.files.file.name,
            size: req.files.file.size
        }
        
        let returnJson = {
            "success": true,
            "message": "Upload complete",
            "user": userInfo.name,
            "fileName": req.files.file.name,
            "fileSize": req.files.file.size,
            "encodedName": encodeURIComponent(urlString),
            "name": urlString, // make this url from the ummmmmmm db shit
            "url": `http${config.https ? 's' : ''}://${userInfo.subdomain}.${userInfo.domain}/${urlString}`
        }

        let out = await db.saveFile(dbObject, durability);
        if (out == false) { return res.status(500).json({ "success": false, "message": "File with generated name already exists. Please try again." }) }

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(returnJson);
    });
});

module.exports = router;