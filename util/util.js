/*
    Useful stuff
*/

const logger = require('./logger.js'), fs = require('fs');
const randomString = require('random-string');

const _printLogo = () => {
    const logo = fs.readdirSync(__dirname + '/logo/');
    logger.logo(fs.readFileSync(__dirname + '/logo/' + logo[Math.floor(Math.random() * logo.length)]).toString());
};

const _characterLogic = (logic, length) => {
    switch (logic) {
        case 'standard':
            return randomString({
                length: length,
                numeric: true,
                letters: true,
                special: false
            });
        case 'zws':
            return; //todo
    }
};

const _addZero = (n) => {
    if (n < 10) n = "0" + n;
    return n;
};

// move this function to util
const _createFilePath = (filePath) => {
    if (fs.existsSync(filePath)) {
        let filePathArray = filePath.split('_')
        let newFilePathNum = (filePathArray.length === 0 ? 0 : parseInt(filePathArray[filePathArray - 1])) + 1
        return filePath
    } else return filePath
};

module.exports.printLogo = _printLogo;
module.exports.characterLogic = _characterLogic;
module.exports.createFilePath = _createFilePath;
module.exports.addZero = _addZero;