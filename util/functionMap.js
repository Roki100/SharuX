// For logging
const logger = require('./logger.js');

// For torrent support
//const 

// Create the Map
const functionMap = new Map();

// Example function
const png = (_png) => {
    return logger.debug('Called the png function!');
};
functionMap.set('png', png);

// so that function is run before it is saved
// so it replaces file?
// no, just runs the function, we can make it return the file if we want
// ok
/*const torrent = (_torrent) => {
   todo 
}*/
// Export it
module.exports = functionMap;