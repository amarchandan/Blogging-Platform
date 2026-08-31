const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { uploadImage } = require('../controllers/uploadController');
const auth = require('../middleware/auth');

router.post('/', auth, upload.single('image'), uploadImage);

module.exports = router;
