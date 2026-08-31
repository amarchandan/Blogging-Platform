const Blog = require('../models/Blog');

exports.createBlog = async (req, res, next) => {
  try {
    const { title, excerpt, content, tags, keywords, status, coverImage } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
    const blog = await Blog.create({
      title,
      excerpt,
      content,
      coverImage: coverImage || null,
      tags: tags || [],
      keywords: keywords || [],
      author: req.userId,
      status: status || 'DRAFT',
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    });
    res.status(201).json({ success: true, data: blog });
  } catch (err) {
    next(err);
  }
};

exports.getBlogBySlug = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const blog = await Blog.findOne({ slug }).populate('author', 'name username avatar');
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    // increment view count
    blog.views = (blog.views || 0) + 1;
    await blog.save();
    res.json({ success: true, data: blog });
  } catch (err) {
    next(err);
  }
};

exports.listBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;
    const filter = { status: 'PUBLISHED' };
    const total = await Blog.countDocuments(filter);
    const items = await Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('author', 'name username avatar');
    res.json({ success: true, data: items, pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total, hasNextPage: skip + items.length < total, hasPreviousPage: page > 1 } });
  } catch (err) {
    next(err);
  }
};

exports.listMyBlogs = async (req, res, next) => {
  try {
    const items = await Blog.find({ author: req.userId }).sort({ updatedAt: -1 }).limit(100).populate('author', 'name username avatar');
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

exports.trending = async (req, res, next) => {
  try {
    // Simple trending score: views + likesCount*10 + commentsCount*5 - age penalty
    const recent = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30); // 30 days
    const items = await Blog.find({ status: 'PUBLISHED' }).populate('author', 'name username avatar');
    const scored = items.map((b) => {
      const likes = (b.likes || []).length;
      const ageDays = Math.max(1, (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const score = (b.views || 0) + likes * 10 + (b.commentsCount || 0) * 5 + (b.featured ? 50 : 0) + (recent < new Date(b.createdAt) ? 30 : 0);
      return { blog: b, score: score / ageDays };
    });
    scored.sort((a, c) => c.score - a.score);
    res.json({ success: true, data: scored.slice(0, 20).map((s) => s.blog) });
  } catch (err) {
    next(err);
  }
};

exports.updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(blog.author) !== String(req.userId) && req.userRole !== 'ADMIN') return res.status(403).json({ success: false, message: 'Forbidden' });
    const updates = req.body;
    Object.assign(blog, updates);
    if (updates.status === 'PUBLISHED' && !blog.publishedAt) blog.publishedAt = new Date();
    await blog.save();
    res.json({ success: true, data: blog });
  } catch (err) { next(err); }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(blog.author) !== String(req.userId) && req.userRole !== 'ADMIN') return res.status(403).json({ success: false, message: 'Forbidden' });
    await Blog.findByIdAndDelete(blog._id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.search = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;
    if (!q) return exports.listBlogs(req, res, next);
    // text search if supported
    const filter = { $text: { $search: q }, status: 'PUBLISHED' };
    let total = await Blog.countDocuments(filter);
    let items = await Blog.find(filter, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } }).skip(skip).limit(limit).populate('author', 'name username avatar');
    // fallback if no items
    if (items.length === 0) {
      const regex = new RegExp(q, 'i');
      const fallbackFilter = { status: 'PUBLISHED', $or: [{ title: regex }, { excerpt: regex }, { content: regex }, { tags: regex }, { keywords: regex }] };
      total = await Blog.countDocuments(fallbackFilter);
      items = await Blog.find(fallbackFilter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('author', 'name username avatar');
    }
    res.json({ success: true, data: items, pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total, hasNextPage: skip + items.length < total, hasPreviousPage: page > 1 } });
  } catch (err) { next(err); }
};
