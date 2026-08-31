const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Not authorized' });
  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
  try {
    req.userId = decoded.id;
    // attach role if possible
    const u = await User.findById(req.userId).select('role');
    req.userRole = u ? u.role : null;
    next();
  } catch (err) {
    // DB or other unexpected error - NOT a token problem, don't tell the client to log out
    return res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};