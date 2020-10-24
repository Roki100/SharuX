/*
    Useful stuff
*/
const logger = require('./logger.js'), fs = require('fs');

const _printLogo = () => {
    const logo = fs.readdirSync(__dirname + '/logo/');
    logger.logo(fs.readFileSync(__dirname + '/logo/' + logo[Math.floor(Math.random() * logo.length)]).toString());
}

module.exports.printLogo = _printLogo;