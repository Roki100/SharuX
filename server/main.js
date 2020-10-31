/*
    Server builder
*/

const config = require('../config.json');
const logger = require('../util/logger.js');
const db = require('../util/db.js');
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
    db.init();
    let app = express();
    let server = http.createServer(app);

    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    app.set('trust proxy', true);
    app.use(expressip());
    app.use(helmet());
    app.use(useragent.express());
    app.use(morgan((tokens, req, res) => {
        logger.request(tokens.method(req, res), tokens.url(req, res), tokens.status(req, res), tokens['response-time'](req, res) + 'ms', (req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress) || "undefined").toString().replace('::ffff:', ''), req.headers['user-agent'], req.ipInfo.country || 'N/A');
    }));
    app.use(express.static(__dirname + '/public/'));

    require('./router').start(app);

    server.listen(port, bind);
    server.on('listening', () => {
        logger.ok(`Server started on ${server.address().address.replace('::', '0.0.0.0')}:${server.address().port}`);
    });
    return server;
};

module.exports.kill = async (server) => {
    logger.warn('Closing the web server...');
    await server.close();
    logger.warn('Closed the web server.');
    await db.stop();
};