const Blog = require('../models/Blog');
const Bookmark = require('../models/Bookmark');

exports.like = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Not found' });
    const userId = req.userId;
    const exists = blog.likes.find((u) => String(u) === String(userId));
    if (exists) {
      blog.likes = blog.likes.filter((u) => String(u) !== String(userId));
    } else {
      blog.likes.push(userId);
    }
    await blog.save();
    res.json({ success: true, data: { likes: blog.likes.length } });
  } catch (err) { next(err); }
};

exports.bookmark = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const userId = req.userId;
    const existing = await Bookmark.findOne({ user: userId, blog: blogId });
    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      return res.json({ success: true, message: 'Removed' });
    }
    const b = await Bookmark.create({ user: userId, blog: blogId });
    res.status(201).json({ success: true, data: b });
  } catch (err) { next(err); }
};

exports.listBookmarks = async (req, res, next) => {
  try {
    const items = await Bookmark.find({ user: req.userId }).populate('blog').sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};
