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


// Responses
const internalDBError = { "success": false, "message": "Internal server error - DataBase unreachable." };
const noToken = { "success": false, "message": "No token was provided." };
const noURL = { "success": false, "message": "No url was provided." };
const incorrectToken = { "success": false, "message": "An incorrect token was provided." };
const movingFileError = { "success": false, "message": "Internal server error while trying to move the file." };
const urlExists = { "success": false, "message": "URL with generated name already exists. Please try again." }

router.post('/api/shorten', async (req, res) => {
    console.log(req.query)
    console.log(req.body)
    let browser = req.body.token == undefined ? false : true;
    // let browser = req.body.token == undefined ? false : true;

    if (!await db.available()) {
        if (!browser) return res.status(500).json(internalDBError);
        else return res.redirect('/?error=' + internalDBError.message)
    }

    let token = browser ? req.body.token : req.headers.token;
    if (!token || token.length !== 69) {
        if (!browser) return res.status(403).json(noToken);
        else return res.redirect('/?error=' + noToken.message);
    }

    let userInfo = await db.getUserInfo(token);
    if (!userInfo) {
        if (!browser) return res.status(403).json(incorrectToken);
        else return res.redirect('/?error=' + incorrectToken.message);
    }

    if (!req.body || !req.body.url) {
        if (!browser) return res.status(400).json(noURL);
        else return res.redirect('/?error=' + noURL.message)
    }

    // Request configuration
    let logic = (browser ? req.body.logic : req.headers.urllogic) == 'zws' ? 'zws' : 'standard';
    let length = !req.headers.urllength ? 15 : req.headers.urllength > 200 ? 200 : req.headers.urllength < 15 ? 15 : req.headers.urllength || 15;
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
    if (out == false) {
        if (!browser) return res.status(500).json(urlExists);
        else return res.redirect('/?error=' + urlExists.message);
    }

    if (!browser) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(returnJson);
    } else return res.redirect('/?message=' +  returnJson.url);
});

module.exports = router;