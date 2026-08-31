const express = require('express');
const router = express.Router();
const { getByUsername, updateProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/:username', getByUsername);
router.put('/profile', auth, updateProfile);

module.exports = router;
