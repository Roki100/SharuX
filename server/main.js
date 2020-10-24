/*
    Server builder
*/

const config = require('../config.json');
const logger = require('../util/logger.js');
const port = config.port || 1337, bind = config.bind || '::1';
const express = require('express');
const http = require('http');
const morgan = require('morgan');
const expressip = require('express-ip-middleware');

module.exports.launch = () => {
    let app = express();
    let server = http.createServer(app);

    app.set('trust proxy', true);
    app.use(expressip());
    app.use(morgan(function (tokens, req, res) {
        logger.request(tokens.method(req, res), tokens.url(req, res), tokens.status(req, res), tokens['response-time'](req, res) + 'ms', req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress) || undefined, req.headers['user-agent'], req.ipInfo.country || 'N/A');
    }));

    app.get('*', (req, res) => {
        res.sendStatus(404);
    });

    server.listen(port, bind);
    server.on('listening', () => {
        logger.ok(`Server started on ${server.address().address}:${server.address().port}`);
    });
};