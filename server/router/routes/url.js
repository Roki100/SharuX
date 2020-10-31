/*
    Short URL route
*/

// Custom Shit
const config = require('../../../config.json');
//const util = require('../../../util/util.js');
const db = require('../../../util/db.js');
const logger = require('../../../util/logger.js');

// Router
const { Router, json, urlencoded } = require('express');
const router = Router();

// Middleware
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 4 * 60 * 1000, // 4 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    message: '<code>Too many requests.</code>'
});
router.use(limiter);

router.get('/s/:name', async (req, res) => {
    if (!await db.available()) return res.status(500).json({ "success": false, "message": "Internal server error - DataBase unreachable." });
    let urlParam = encodeURIComponent(req.params.name);
    
    let url = await db.getURLInfo(urlParam);
    if (!url) return res.status(302).redirect('/');

    let sourceURL = url.sourceURL;

    db.addURLView(url.id);
    return res.redirect(sourceURL);
});

router.get('/s', async (req, res) => {
    return res.status(200).send('Are you lost?<br><img src=/img/fullbruh.png />');
});


module.exports = router;