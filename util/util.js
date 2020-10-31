/*
    Useful stuff
*/

const logger = require('./logger.js'), fs = require('fs');
const randomString = require('random-string');
const zws_chars = ['\u180E', '\u200B', '\uFEFF', '\u200C', '\u200D', '\u2060'];

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
            return _genZws(length);
    }
};

const _genZws = (length) => {
    let out = '';
    for (let i = 0; i < length; i++) {
        out += zws_chars[Math.floor(Math.random() * zws_chars.length)];
    }
    return out;
}

const _generateToken = () => {
    return randomString({
        length: 69,
        numeric: true,
        letters: true,
        special: true
    });
}

const _addZero = (n) => {
    if (n < 10) n = "0" + n;
    return n;
};

// move this function to util
const _createFilePath = (fileName) => {
    if (fs.existsSync(__dirname + '/../' + fileName)) {
        let fileNameArray = fileName.split('.');
        let filePathArray = fileNameArray[fileNameArray.length - 2].split('_');
        let oldNum = parseInt(filePathArray[filePathArray.length - 1])
        let newNum = (filePathArray.length === 1) ? 1 : isNaN(oldNum) ? 1 : oldNum + 1;
        fileName = filePathArray[0] + '_' + newNum + '.' + fileNameArray[fileNameArray.length - 1];
        return _createFilePath(fileName);
    } else return fileName
};

module.exports.printLogo = _printLogo;
module.exports.characterLogic = _characterLogic;
module.exports.createFilePath = _createFilePath;
module.exports.addZero = _addZero;
module.exports.genZws = _genZws;
module.exports.generateToken = _generateToken;