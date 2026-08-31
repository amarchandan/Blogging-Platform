const express = require('express');
const router = express.Router();
const { createBlog, getBlogBySlug, listBlogs, listMyBlogs, trending, updateBlog, deleteBlog, search } = require('../controllers/blogController');
const auth = require('../middleware/auth');

router.get('/', listBlogs);
router.get('/search', search);
router.get('/trending', trending);
router.get('/mine', auth, listMyBlogs);
router.get('/:slug', getBlogBySlug);
router.post('/', auth, createBlog);
router.put('/:id', auth, updateBlog);
router.delete('/:id', auth, deleteBlog);

module.exports = router;
