// For logging
const logger = require("./logger");

// Create the Map
const functionMap = new Map();

// Example function
const png = (_png) => {
    return logger.debug('Called the png function!');
};
functionMap.set('png', png);

// Export it
module.exports = functionMap;