const express = require('express');
const router = express.Router();
const { listForBlog, create, update, remove } = require('../controllers/commentController');
const auth = require('../middleware/auth');

router.get('/blog/:id', listForBlog);
router.post('/blog/:id', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);

module.exports = router;
