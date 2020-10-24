/*
    Server builder
*/

const config = require('../config.json');
const logger = require('../util/logger.js');
const port = config.port || 1337, bind = config.bind || '::1';
const express = require('express');
const http = require('http');

module.exports.launch = () => {
    let app = express();
    let server = http.createServer(app);

    app.set('trust proxy', true);

    server.listen(port, bind);
    server.on('listening', () => {
        logger.ok(`Server started on ${server.address().address}:${server.address().port}`);
    });
};