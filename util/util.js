/*
    Useful stuff
*/

const logger = require('./logger.js'), fs = require('fs');
const randomString = require('random-string');

const _printLogo = () => {
    const logo = fs.readdirSync(__dirname + '/logo/');
    logger.logo(fs.readFileSync(__dirname + '/logo/' + logo[Math.floor(Math.random() * logo.length)]).toString());
}

const _characterLogic = (logic, length) => {
    switch (logic) {
        case standard:
            return randomString({
                length: length,
                numeric: true,
                letters: true,
                special: false
            });
        case zws:
            return; //todo
    }
}

module.exports.printLogo = _printLogo;
module.exports.characterLogic = _characterLogic;