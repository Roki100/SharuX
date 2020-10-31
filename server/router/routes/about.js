// Router
const { Router } = require('express');
const router = Router();
const { faq } = require('../../../faq.json');
const oldfaq = [
    { question: 'What is SharuX?', answer: 'Sharux is a <a class="answer neon" href="https://getsharex.com/">ShareX</a> upload server.' },
    { question: 'Who made it?', answer: 'SharuX is made by <a class="answer neon" href="https://github.com/Roki100">Roki</a> with help of <a class="answer neon" href="https://github.com/Million900o">Million</a>' },
    { question: 'Can i use it?', answer: 'Yes, you can. Just sign up' },
    { question: 'Can i see the source code?', answer: 'SharuX is fully open sourced project and the source code is available <a class="answer neon" href="https://github.com/Roki100/SharuX">here</a>.' }
];

router.get('/about', (req, res) => {
    res.render('about', { faq: faq, cache: true });
});

module.exports = router;