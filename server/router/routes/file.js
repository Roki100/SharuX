/*
    File routes 
*/

// Custom Shit
const config = require('../../../config.json');
const util = require('../../../util/util.js');
const db = require('../../../util/db.js');
const logger = require('../../../util/logger.js');

// Router
const { Router } = require('express');
const router = Router();

// Packages
const hljs = require('highlight.js');
const fs = require('fs');
const path = require('path');

router.get('/f/:file', async (req, res) => {
    if (!await db.available()) return res.status(500).json({ "success": false, "message": "Internal server error - DataBase unreachable." });
    let fileParam = encodeURIComponent(req.params.file);

    let file = await db.getFileInfo(fileParam);
    if(!file) return res.render('files/404', { fileName: fileParam });
    
    let arr = file.originalName.split('.');
    let fileExtension = arr[arr.length - 1];
    let fileData = fs.readFileSync(path.resolve(__dirname + '../../../../' + file.path), 'UTF8');
    let output = hljs.highlightAuto(fileData).value
    if(fileExtension == 'js') {
        res.render('files/text', { contents: output });
    }
});

module.exports = router;