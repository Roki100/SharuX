/*
    Logger
*/

const colors = require('colors/safe');
const { debug } = require('../config.json');
const util = require('../util/util.js');
const zero = util.addZero;

function getDate() {
    let date = new Date();
    let day = zero(date.getDate());
    let month = zero(date.getMonth() + 1);
    let year = zero(date.getFullYear());
    let h = zero(date.getHours());
    let m = zero(date.getMinutes());
    let s = zero(date.getSeconds());
    return `[${day}-${month}-${year} | ${h}:${m}:${s}]`;
}

const _logo = (logo) => {
    console.log(colors.brightGreen(logo));
};

const _ok = (message, ...args) => {
    console.log(getDate(), colors.green('[OK]', colors.reset(message, ((args.length > 0) ? args.join(' ') : ''))));
};

const _warn = (message, ...args) => {
    console.log(getDate(), colors.yellow('[WARN]', colors.reset(message, ((args.length > 0) ? args.join(' ') : ''))));
};

const _err = (message, ...args) => {
    console.log(getDate(), colors.brightRed('[ERR]', colors.reset(message, ((args.length > 0) ? args.join(' ') : ''))));
};

const _debug = (message, ...args) => {
    if (debug)
        console.log(getDate(), colors.magenta('[DEBUG]', colors.reset(message, ((args.length > 0) ? args.join(' ') : ''))));
};

const _request = (type, path, response, time, ip, agent, country) => {
    console.log(getDate(), colors.cyan('[REQ]', colors.reset(`${ip} (${country}) - ${type} ${path} (${response}) [${time}]`)));
};

const _db = (message, ...args) => {
    console.log(getDate(), colors.blue('[RDB]', colors.reset(message, ((args.length > 0) ? args.join(' ') : ''))));
};

module.exports.ok = _ok;
module.exports.warn = _warn;
module.exports.error = _err
module.exports.debug = _debug;
module.exports.request = _request;
module.exports.db = _db;
module.exports.logo = _logo;