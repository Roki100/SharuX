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
router.use(limiter);
const multer = require('multer');
const upload = multer();
router.use(json());
const authentication = require('../../middleware/authentication.js');

// Responses
const noURL = { "success": false, "message": "No url was provided." };
const urlExists = { "success": false, "message": "URL with generated name already exists. Please try again." };

router.post('/api/shorten', upload.none(), authentication, async (req, res) => {
    if (!req.body || !req.body.url) {
        if (!req.browser) return res.status(400).json(noURL);
        else return res.redirect('/?error=' + noURL.message);
    }

    // Request configuration
    let logic = (req.browser ? req.body.logic : req.headers.urllogic) == 'zws' ? 'zws' : 'standard';
    let length = !req.headers.urllength ? 15 : req.headers.urllength > 200 ? 200 : req.headers.urllength < 15 ? 15 : req.headers.urllength || 15;
    let urlString = util.characterLogic(logic, length);
    let durability = config.durabilityHeader == true ? (req.headers.mode == undefined ? config.db.durability : (req.headers.mode == 'safe') ? 'hard' : (req.headers.mode == 'fast') ? 'soft' : 'hard') : config.db.durability;

    let dbObject = {
        name: encodeURIComponent(urlString),
        sourceURL: req.body.url,
        uploaderName: req.userInfo.name,
        uploaderID: req.userInfo.id,
        redirects: 0
    };

    let returnJson = {
        "success": true,
        "message": "Shortening complete",
        "user": req.userInfo.name,
        "sourceURL": req.body.url,
        "encodedName": encodeURIComponent(urlString),
        "name": urlString, // make this url from the ummmmmmm db shit
        "url": `http${config.https ? 's' : ''}://${req.userInfo.subdomain}.${req.userInfo.domain}/s/${urlString}`
    };

    let out = await db.shortenURL(dbObject, durability);
    if (out == false) {
        if (!req.browser) return res.status(500).json(urlExists);
        else return res.redirect('/?error=' + urlExists.message);
    }

    if (!req.browser) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(returnJson);
    } else return res.redirect('/?message=' + returnJson.url);
});

module.exports = router;