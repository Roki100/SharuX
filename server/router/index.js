/*
    Router launcher
*/

// Load api endpoints
const fs = require('fs');
const logger = require('../../util/logger.js');
const api = [];
let files = fs.readdirSync(__dirname + '/api/');
files.forEach(file => { api.push(file) });


let start = (app) => {
    // Load api endpoints
    api.forEach(el => {
        app.use(require('./api/' + el));
        logger.debug(`Loaded ${el} API endpoint.`);
    });
    // Load other endpoints
    // TODO
    // Handle the 404/400
    app.get('*', (req, res) => { return res.status(302).redirect('/'); });
    app.post('*', (req, res) => { return res.sendStatus(400); });
    app.put('*', (req, res) => { return res.sendStatus(400); });
    app.patch('*', (req, res) => { return res.sendStatus(400); });
    app.delete('*', (req, res) => { return res.sendStatus(400); });
};

module.exports = { start };