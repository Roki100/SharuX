// Router
const { Router } = require('express');
const router = Router();

router.get('*', (req, res) => {
    res.render('404', { errText: '<Error 404 - Page not found/>', errCommentText: 'how did you get here?', takeMeBackText: '<take me back/>' }); // no fucking idea how to put this in html
});

module.exports = router;