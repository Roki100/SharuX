/*
    File routes 
*/

// Custom Shit
const config = require('../../../config.json');
const util = require('../../../util/util.js');
const db = require('../../../util/db.js');
const logger = require('../../../util/logger.js');
const { version } = require('../../../package.json');

// Router
const { Router } = require('express');
const router = Router();

// Packages
//const hljs = require('highlight.js');
const fs = require('fs');
const path = require('path');
const { StaticPool } = require("node-worker-threads-pool");
const staticPool = new StaticPool({
    size: 7,
    task: (fileData) => {
      const h = require('highlight.js');
      if (fileData.split('\n').length > 10000) {
          return h.highlight('plaintext', fileData).value;
      }
      return h.highlightAuto(fileData).value;
    },
});

router.get('/f/:file', async (req, res) => {
    if (!await db.available()) return res.status(500).json({ "success": false, "message": "Internal server error - DataBase unreachable." });
    let fileParam = encodeURIComponent(req.params.file);

    let file = await db.getFileInfo(fileParam);
    if(!file) return res.render('files/404', { fileName: fileParam });
    
    let arr = file.originalName.split('.');
    let fileExtension = arr[arr.length - 1];
    let filePath = path.resolve(__dirname + '../../../../' + file.path);
    let fileName = file.originalName;

    let type = await util.getFileType(fileExtension, filePath);
    
    switch (type) {
        case 'image':
            // todo
            break;
        case 'video':
            // todo
            break;
        case 'audio':
            // todo
            break;
        case 'text':
            let fileData = fs.readFileSync(filePath, 'UTF8');
            //let output = hljs.highlightAuto(fileData).value
            let output = await staticPool.exec(fileData);
            res.render('files/text', { fileName: fileName, userName: file.uploaderName, rawFileURL: file.name, URL: req.protocol+'://'+req.get('host')+req.path, contents: output, version: version });
            break;
        case 'other':
            // redir to raw
            break;
    }

});

module.exports = router;