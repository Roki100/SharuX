/*
    Logger
*/

const colors = require('colors/safe');
const { debug } = require('../config.json');

function getDate() {
    let date = new Date()
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
        return i;
    }
    return `[${day}-${month}-${year} | ${h}:${m}:${s}]`;
}

const _ok = (message) => {
    console.log(getDate(), colors.green('[OK]', colors.reset(message)));
}

const _warn = (message) => {
    console.log(getDate(), colors.yellow('[WARN]', colors.reset(message)));
}

const _debug = (message) => {
    if (debug)
        console.log(getDate(), colors.magenta('[DEBUG]', colors.reset(message)));
}



module.exports.ok = _ok;
module.exports.warn = _warn;
module.exports.debug = _debug;