// Router
const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
    res.render('index', { success: req.query.message, error: req.query.error});
});

module.exports = router;