const express = require('express');
const router = express.Router();
const { submit } = require('../controllers/ratingController');
const auth = require('../middleware/auth');

router.post('/blog/:id', auth, submit);

module.exports = router;
