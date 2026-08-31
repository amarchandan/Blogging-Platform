const Rating = require('../models/Rating');
const Blog = require('../models/Blog');

exports.submit = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Invalid rating' });
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    const existing = await Rating.findOne({ blog: blogId, user: req.userId });
    if (existing) {
      existing.rating = rating;
      await existing.save();
    } else {
      await Rating.create({ blog: blogId, user: req.userId, rating });
    }
    // calculate avg
    const stats = await Rating.aggregate([{ $match: { blog: blog._id } }, { $group: { _id: '$blog', avg: { $avg: '$rating' }, count: { $sum: 1 } } }]);
    res.json({ success: true, data: stats[0] || { avg: 0, count: 0 } });
  } catch (err) { next(err); }
};
