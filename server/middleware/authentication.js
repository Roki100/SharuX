// Custom Shit
const db = require('../../util/db.js');

const noToken = { "success": false, "message": "No token was provided." };
const incorrectToken = { "success": false, "message": "An incorrect token was provided." };
const internalDBError = { "success": false, "message": "Internal server error - DataBase unreachable." };

async function authentication(req, res, next) {
  let browser = req.body.token == undefined ? false : true;

  // Errors
  if (!await db.available()) {
    if (!browser) return res.status(500).json(internalDBError);
    else return res.redirect('/?error=' + internalDBError.message);
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

  // Make it so you can access userdata everywhere.
  req.userInfo = userInfo;
  req.userToken = token;
  req.browser = browser;

  // Call the function to go to the next one.
  next();
}

module.exports = authentication;
