const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validator = require('validator');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

exports.register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email' });
    }
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ success: false, message: 'Email or username already in use' });
    const user = await User.create({ name, username, email, password });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, data: { user: { id: user._id, name: user.name, username: user.username, email: user.email }, token } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) return res.status(400).json({ success: false, message: 'Missing credentials' });
    const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = generateToken(user._id);
    res.json({ success: true, data: { user: { id: user._id, name: user.name, username: user.username, email: user.email }, token } });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
