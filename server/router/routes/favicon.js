/*
    Send 404 on this stupid shit useless browser requests
*/

// Router
const { Router } = require('express');
const router = Router();

router.get('/favicon.ico', async (req, res) => {
    return res.status(404).end('fuck off');
});

module.exports = router;