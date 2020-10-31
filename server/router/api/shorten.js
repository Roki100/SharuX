/*
    Shorten api endpoint
*/

// Custom Shit
const config = require('../../../config.json');
const util = require('../../../util/util.js');
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
//router.use(limiter);
router.use(json());
//router.use(urlencoded({ extended: true }));

router.post('/api/shorten', async (req, res) => {
    if (!await db.available()) return res.status(500).json({ "success": false, "message": "Internal server error - DataBase unreachable." });
    let token = req.headers.token;
    if (!token || token.length !== 69) return res.status(403).json({ "success": false, "message": "No token was provided." });
    let userInfo = await db.getUserInfo(token);
    if (!userInfo) return res.status(403).json({ "success": false, "message": "Wrong token was provided." });
    if (!req.body || !req.body.url) return res.status(400).json({ "success": false, "message": "No url was provided." });

    // Request configuration
    let logic = req.headers.urllogic == 'zws' ? 'zws' : 'standard';
    let length = req.headers.urllength > 200 ? 200 : req.headers.urllength < 10 ? 10 : req.headers.urllength || 10;
    let urlString = util.characterLogic(logic, length);
    let durability = config.durabilityHeader == true ? (req.headers.mode == undefined ? config.db.durability : (req.headers.mode == 'safe') ? 'hard' : (req.headers.mode == 'fast') ? 'soft' : 'hard') : config.db.durability;
    

    let dbObject = {
        name: encodeURIComponent(urlString),
        sourceURL: req.body.url,
        uploaderName: userInfo.name,
        uploaderID: userInfo.id,
        redirects: 0
    }
    
    let returnJson = {
        "success": true,
        "message": "Shortening complete",
        "user": userInfo.name,
        "sourceURL": req.body.url,
        "encodedName": encodeURIComponent(urlString),
        "name": urlString, // make this url from the ummmmmmm db shit
        "url": `http${config.https ? 's' : ''}://${userInfo.subdomain}.${userInfo.domain}/s/${urlString}`
    }

    let out = await db.shortenURL(dbObject, durability);
    if (out == false) { return res.status(500).json({ "success": false, "message": "URL with generated name already exists. Please try again." }) }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(returnJson);
});

module.exports = router;