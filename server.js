/*
    Launcher of the server
*/

const server = require('./server/main.js');
const logger = require('./util/logger.js'), util = require('./util/util.js');
const fs = require('fs');
util.printLogo();
if (!fs.existsSync('./uploads/')) {
    logger.warn('./uploads/ folder does not exist!');
    logger.debug('Creating ./uploads/ folder.');
    fs.mkdirSync('./uploads/');
    logger.ok('Created ./uploads/ folder.');
}
logger.debug('Launching the server...');
let srv = server.launch();

process.on('SIGINT', async () => {
    await server.kill(srv);
    logger.warn('Gracefully shutting down.'); process.exit();
});