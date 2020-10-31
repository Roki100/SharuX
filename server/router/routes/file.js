/*
    Raw file route
*/

// Custom Shit
const db = require('../../../util/db.js');
const logger = require('../../../util/logger.js');
const { resolve } = require('path');
const { existsSync } = require('fs');

// Router
const { Router } = require('express');
const router = Router();

// Middleware
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 4 * 60 * 1000, // 4 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    message: '<code>Too many requests.</code>'
});
router.use(limiter);

router.get('/raw/:file', async (req, res) => {
    if (!await db.available()) return res.status(500).json({ "success": false, "message": "Internal server error - DataBase unreachable." });
    let fileParam = encodeURIComponent(req.params.file);
    
    let file = await db.getFileInfo(fileParam);
    if (!file) return res.status(302).redirect('/');

    let filePath = resolve(__dirname + '../../../../' + file.path);

    if (!existsSync(filePath)) return res.sendStatus(500);
    //await db.addFileView(file.id);
    db.addFileView(file.id);
    return res.status(200).sendFile(filePath);
});

router.get('/raw', async (req, res) => {
    return res.status(200).send('Are you lost?<br><img src=/img/fullbruh.png />');
});

module.exports = router;