/*
    Server builder
*/

const config = require('../config.json');
const logger = require('../util/logger.js');
const port = config.port || 1337, bind = config.bind || '::';
const express = require('express');
const http = require('http');
// Middlewares
const morgan = require('morgan');
const expressip = require('express-ip-middleware');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const useragent = require('express-useragent');

module.exports.launch = () => {
    let app = express();
    let server = http.createServer(app);

    app.set('trust proxy', true);
    app.use(expressip());
    app.use(helmet());
    app.use(useragent.express());
    app.use(morgan(function (tokens, req, res) {
        logger.request(tokens.method(req, res), tokens.url(req, res), tokens.status(req, res), tokens['response-time'](req, res) + 'ms', req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress) || undefined, req.headers['user-agent'], req.ipInfo.country || 'N/A');
    }));

    app.get('*', (req, res) => {
        if(req.useragent.isBot) return res.sendStatus(200);
        res.sendStatus(404);
    });

    server.listen(port, bind);
    server.on('listening', () => {
        logger.ok(`Server started on ${server.address().address}:${server.address().port}`);
    });
};