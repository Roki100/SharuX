/*
    Upload api endpoint
*/

const config = require('../../../config.json');
const util = require('../../../util/util.js');
const { Router } = require('express');
const router = Router();
const fileUpload = require('express-fileupload');
const path = require('path');
const tokens = ['test'];

router.use(fileUpload({
    safeFileNames: true, // Strips weird characters from file names
    preserveExtension: 7, // Supports file extensions of upto 7 characters (.torrent)
    useTempFiles: true, // Important option - removes the possiblity of out-of-memory crash from a large uploads
    tempFileDir: path.resolve(__dirname + '../../../tmp/'),
    limits: {
        fileSize: config.maxFileSize || Infinity, // Max file size in bytes
    }
}));

router.post('/api/post', async (req, res) => {
    let token = req.headers.token;
    if (!token) return res.status(403).json({ "success": false, "message": "No token was provided." });
    if (!tokens.includes(token)) return res.status(403).json({ "success": false, "message": "Wrong token was provided." });
    if (!req.files || !req.files.file) return res.status(400).json({ "success": false, "message": "No file was provided." });
});

module.exports = router;