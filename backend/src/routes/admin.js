const express = require('express');
const router = express.Router();
const { dashboard, listUsers } = require('../controllers/adminController');
const auth = require('../middleware/auth');

// simple admin guard middleware
const adminOnly = async (req, res, next) => {
  // load user and check role
  const User = require('../models/User');
  const u = await User.findById(req.userId);
  if (!u || u.role !== 'ADMIN') return res.status(403).json({ success: false, message: 'Admin only' });
  next();
};

router.get('/dashboard', auth, adminOnly, dashboard);
router.get('/users', auth, adminOnly, listUsers);
router.delete('/users/:id', auth, adminOnly, require('../controllers/adminController').deleteUser);
router.get('/comments', auth, adminOnly, require('../controllers/adminController').listComments);
router.post('/backfill-covers', auth, adminOnly, require('../controllers/adminController').backfillCovers);

module.exports = router;
