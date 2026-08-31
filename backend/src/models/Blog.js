const mongoose = require('mongoose');
const slugify = require('slugify');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  excerpt: { type: String },
  content: { type: String },
  coverImage: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [{ type: String }],
  keywords: [{ type: String }],
  status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  canonicalUrl: String,
  ogImage: String,
  featured: { type: Boolean, default: false },
  publishedAt: Date,
}, { timestamps: true });

BlogSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// keep a comments count for trending and quick stats
BlogSchema.add({ commentsCount: { type: Number, default: 0 } });

// text index for search
BlogSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text', keywords: 'text' });

module.exports = mongoose.model('Blog', BlogSchema);
