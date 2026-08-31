const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
}, { timestamps: true });

BookmarkSchema.index({ user: 1, blog: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', BookmarkSchema);
