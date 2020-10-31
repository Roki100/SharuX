/*
    Router launcher
*/

// Load api endpoints
const fs = require('fs');
const logger = require('../../util/logger.js');
const api = [], routes = [], errorRoutes = [];
let apiFiles = fs.readdirSync(__dirname + '/api/'), routeFiles = fs.readdirSync(__dirname + '/routes/'), errorRouteFiles = fs.readdirSync(__dirname + '/routes/errors/');
apiFiles.forEach(file => { api.push(file); }); routeFiles.forEach(file => { routes.push(file); }); errorRouteFiles.forEach(file => { errorRoutes.push(file) });


let start = (app) => {
    // Load api endpoints
    api.forEach(el => {
        app.use(require('./api/' + el));
        logger.ok(`Loaded ${el} API endpoint.`);
    });
    // Load other endpoints
    routes.forEach(el => {
        if (!el.endsWith('.js')) return;
        app.use(require('./routes/' + el));
        logger.ok(`Loaded ${el} route.`);
    });
    // Load error endpoints
    errorRoutes.forEach(el => {
        app.use(require('./routes/errors/' + el));
        logger.ok(`Loaded ${el} error route.`);
    });
    // Handle the 404/400
    //app.get('*', (req, res) => { return res.status(302).redirect('/'); });
    //app.get('*', (req, res) => { return res.status(404).render('404'); });
    //app.use(require('./routes/errors/404.js')); logger.ok(`Loaded 404 error route.`);
    app.post('*', (req, res) => { return res.sendStatus(400); });
    app.put('*', (req, res) => { return res.sendStatus(400); });
    app.patch('*', (req, res) => { return res.sendStatus(400); });
    app.delete('*', (req, res) => { return res.sendStatus(400); });
};

module.exports = { start };