/*
    Upload api endpoint
*/

const config = require('../../../config.json');
const util = require('../../../util/util.js');
const db = require('../../../util/db.js');
const logger = require('../../../util/logger.js');
const fs = require('fs');
const { Router } = require('express');
const router = Router();
const fileUpload = require('express-fileupload');
const path = require('path');
const tokens = ['test'];
const MAP = require('../../../util/functionMap');
const { isRegExp } = require('util');


let userID = 'hardcode'

router.use(fileUpload({
    safeFileNames: true, // Strips weird characters from file names
    preserveExtension: 10, // Supports file extensions of upto all characters (.torrent)
    useTempFiles: true, // Important option - removes the possiblity of out-of-memory crash from a large uploads
    tempFileDir: path.resolve(__dirname + '../../../../tmp/'),
    limits: {
        fileSize: config.maxFileSize || Infinity, // Max file size in bytes
    }
}));


router.post('/api/post', async (req, res) => {
    let token = req.headers.token;
    if (!token) return res.status(403).json({ "success": false, "message": "No token was provided." });
    if (!tokens.includes(token)) return res.status(403).json({ "success": false, "message": "Wrong token was provided." });
    if (!req.files || !req.files.file) return res.status(400).json({ "success": false, "message": "No file was provided." });

    let fileNameArray = req.files.file.name.split('.');
    let fileExtention = fileNameArray[fileNameArray.length - 1];

    let fileFunction = MAP.get(fileExtention);
    if (fileFunction !== undefined) await fileFunction(req.files.file);


    let logic = req.headers.urlLogic || 'standard';
    let length = req.headers.urlLength > 126 ? 126 : req.headers.urlLength < 10 ? 10 : req.headers.urlLength || 15;
    let urlString = util.characterLogic(logic, length);


    // hippity hoppity my code is now your property
    let date = new Date();
    let year = util.addZero(date.getFullYear());
    let month = util.addZero(date.getMonth() + 1);
    let day = util.addZero(date.getDate());

    if (!fs.existsSync(__dirname + `../../../../uploads/${userID}`)) fs.mkdirSync(__dirname + `../../../../uploads/${userID}`);
    if (!fs.existsSync(__dirname + `../../../../uploads/${userID}/${year}`)) fs.mkdirSync(__dirname + `../../../../uploads/${userID}/${year}`);
    if (!fs.existsSync(__dirname + `../../../../uploads/${userID}/${year}/${month}`)) fs.mkdirSync(__dirname + `../../../../uploads/${userID}/${year}/${month}`);
    if (!fs.existsSync(__dirname + `../../../../uploads/${userID}/${year}/${month}/${day}`)) fs.mkdirSync(__dirname + `../../../../uploads/${userID}/${year}/${month}/${day}`);

    let bigBoiPath = `${userID}/${year}/${month}/${day}/`;
    let filePath = util.createFilePath(path.resolve(__dirname + '../../../../uploads/' + bigBoiPath + req.files.file.name).replace('_', '-'))

    // million was here OwO UwU 0w0
    req.files.file.mv(filePath, async (err) => {
        if (err) {
            res.status(500).json({ "success": false, "message": "Internal server error while trying to move the file." });
            return logger.error(`Cannot move file ${req.files.file.name} to ${filePath} - upload for user ${token}\n${err}`); // change to username later
        };

        // file: {
        //     id: String,
        //     path: String,
        //     uploaderID: String,
        //     createdAt: String, // hardcode this for now
        //     views: Number,
        //     oldName: String,
        //   },

        //db shit goes here
        let dbObject = {
            name: urlString,
            path: filePath,
            uploaderID: userID,
            views: 0,
            oldName: req.files.file.name
        }

        let returnJson = {
            "success": true,
            "message": "Upload complete",
            "url": urlString // make this url from the ummmmmmm db shit
        }

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(returnJson);
    });
});

module.exports = router;