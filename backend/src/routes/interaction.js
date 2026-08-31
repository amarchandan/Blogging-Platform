const express = require('express');
const router = express.Router();
const { like, bookmark, listBookmarks } = require('../controllers/interactionController');
const auth = require('../middleware/auth');

router.post('/blog/:id/like', auth, like);
router.post('/blog/:id/bookmark', auth, bookmark);
router.get('/bookmarks', auth, listBookmarks);

module.exports = router;
