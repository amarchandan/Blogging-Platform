const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

exports.listForBlog = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const items = await Comment.find({ blog: blogId }).populate('user', 'name username avatar').sort({ createdAt: 1 });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const { content, parentComment } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Content required' });
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    const comment = await Comment.create({ blog: blogId, user: req.userId, content, parentComment: parentComment || null });
        // increment blog commentsCount (guard against failures)
        try { await Blog.findByIdAndUpdate(blogId, { $inc: { commentsCount: 1 } }); } catch (e) { console.error('Failed to increment commentsCount', e); }
      res.status(201).json({ success: true, data: await comment.populate('user', 'name username avatar') });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const c = await Comment.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(c.user) !== String(req.userId)) return res.status(403).json({ success: false, message: 'Forbidden' });
    c.content = req.body.content || c.content;
    await c.save();
    res.json({ success: true, data: c });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const c = await Comment.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(c.user) !== String(req.userId) && req.userRole !== 'ADMIN') return res.status(403).json({ success: false, message: 'Forbidden' });
    // remove comment
    try {
      await Comment.findByIdAndDelete(c._id);
    } catch (e) { console.error('Failed to delete comment', e); }
    // decrement blog commentsCount (guard against failures)
    try { await Blog.findByIdAndUpdate(c.blog, { $inc: { commentsCount: -1 } }); } catch (e) { console.error('Failed to decrement commentsCount', e); }
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};
