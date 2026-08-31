const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');

exports.dashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const published = await Blog.countDocuments({ status: 'PUBLISHED' });
    const drafts = await Blog.countDocuments({ status: 'DRAFT' });
    const totalComments = await Comment.countDocuments();
    const totalRatings = await Rating.countDocuments();
    res.json({ success: true, data: { totalUsers, totalBlogs, published, drafts, totalComments, totalRatings } });
  } catch (err) { next(err); }
};

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(200).lean();
    const userIds = users.map(user => user._id);
    const stats = await Blog.aggregate([
      { $match: { author: { $in: userIds } } },
      { $group: { _id: '$author', postCount: { $sum: 1 }, totalViews: { $sum: { $ifNull: ['$views', 0] } } } },
    ]);
    const statsByUser = new Map(stats.map(item => [String(item._id), item]));
    const data = users.map(user => ({ ...user, postCount: statsByUser.get(String(user._id))?.postCount || 0, totalViews: statsByUser.get(String(user._id))?.totalViews || 0 }));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.userId)) return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await Blog.deleteMany({ author: user._id });
    await Comment.deleteMany({ user: user._id });
    await Rating.deleteMany({ user: user._id });
    await User.findByIdAndDelete(user._id);
    res.json({ success: true, message: 'User and authored content deleted' });
  } catch (err) { next(err); }
};

exports.listComments = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, q } = req.query;
    const filter = {};
    if (q) filter.content = { $regex: q, $options: 'i' };
    const skip = (page - 1) * limit;
    const items = await Comment.find(filter).populate('user', 'name username').populate('blog', 'title slug').sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit));
    const total = await Comment.countDocuments(filter);
    res.json({ success: true, data: { items, total, page: Number(page), limit: Number(limit) } });
  } catch (err) { next(err); }
};

exports.backfillCovers = async (req, res, next) => {
  try {
    const fallback = req.body.fallback || null;
    const filter = {
      $or: [
        { coverImage: { $exists: false } },
        { coverImage: null },
        { coverImage: '' },
        { coverImage: 'cover' },
      ],
    };
    const update = { $set: { coverImage: fallback } };
    const result = await Blog.updateMany(filter, update);
    const matched = result.matchedCount || result.n || 0;
    const modified = result.modifiedCount || result.nModified || 0;
    res.json({ success: true, data: { matched, modified } });
  } catch (err) { next(err); }
};
