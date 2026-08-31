const User = require('../models/User');
const Blog = require('../models/Blog');
const Rating = require('../models/Rating');

exports.getByUsername = async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const blogs = await Blog.find({ author: user._id, status: 'PUBLISHED' }).sort({ publishedAt: -1 }).limit(20);
    const totalBlogs = await Blog.countDocuments({ author: user._id });
    const published = await Blog.countDocuments({ author: user._id, status: 'PUBLISHED' });
    const drafts = await Blog.countDocuments({ author: user._id, status: 'DRAFT' });
    const viewsAgg = await Blog.aggregate([{ $match: { author: user._id } }, { $group: { _id: null, totalViews: { $sum: '$views' } } }]);
    const totalViews = (viewsAgg[0] && viewsAgg[0].totalViews) || 0;
    // ratings for author's blogs
    const blogIds = (await Blog.find({ author: user._id }).select('_id')).map(b=>b._id);
    let avgRating = 0; let ratingCount = 0;
    if (blogIds.length) {
      const r = await Rating.aggregate([{ $match: { blog: { $in: blogIds } } }, { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }]);
      if (r[0]) { avgRating = r[0].avg; ratingCount = r[0].count }
    }
    res.json({ success: true, data: { user, stats: { totalBlogs, published, drafts, totalViews, avgRating, ratingCount }, blogs } });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : undefined;
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : undefined;
    if (name !== undefined && !name) return res.status(400).json({ success: false, message: 'Name is required' });
    if (username !== undefined && !username) return res.status(400).json({ success: false, message: 'Username is required' });
    if (username && username !== user.username) {
      const taken = await User.findOne({ username, _id: { $ne: user._id } }).select('_id');
      if (taken) return res.status(409).json({ success: false, message: 'Username already exists. Please choose another.' });
      user.username = username;
    }
    if (name !== undefined) user.name = name;
    ['bio','avatar'].forEach(k => { if (req.body[k] !== undefined) user[k] = req.body[k]; });
    await user.save();
    const safeUser = user.toObject();
    delete safeUser.password;
    res.json({ success: true, data: safeUser });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.username) return res.status(409).json({ success: false, message: 'Username already exists. Please choose another.' });
    next(err);
  }
};
