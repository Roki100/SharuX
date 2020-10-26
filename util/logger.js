/*
    Logger
*/

const colors = require('colors/safe');
const { debug } = require('../config.json');

function getDate() {
    let date = new Date();
    let day = zero(date.getDate());
    let month = zero(date.getMonth() + 1);
    let year = zero(date.getFullYear());
    let h = zero(date.getHours());
    let m = zero(date.getMinutes());
    let s = zero(date.getSeconds());
    function zero(n) {
        if (n < 10) {
            n = "0" + n;
        }
        return n;
    }
    return `[${day}-${month}-${year} | ${h}:${m}:${s}]`;
}

const _logo = (logo) => {
    console.log(colors.brightGreen(logo));
};

const _ok = (message, ...args) => {
    console.log(getDate(), colors.green('[OK]', colors.reset(message, ((args.length > 0) ? args.join(' ') : ''))));
};

const _warn = (message, ...args) => {
    console.log(getDate(), colors.yellow('[WARN]', colors.reset(message, colors.reset(message, ((args.length > 0) ? args.join(' ') : '')))));
};

const _debug = (message, ...args) => {
    if (debug)
        console.log(getDate(), colors.magenta('[DEBUG]', colors.reset(message, colors.reset(message, ((args.length > 0) ? args.join(' ') : '')))));
};

const _request = (type, path, response, time, ip, agent, country) => {
    console.log(getDate(), colors.cyan('[REQ]', colors.reset(`${ip} (${country}) - ${type} ${path} (${response}) [${time}]`)));
};

module.exports.ok = _ok;
module.exports.warn = _warn;
module.exports.debug = _debug;
module.exports.request = _request;
module.exports.logo = _logo;