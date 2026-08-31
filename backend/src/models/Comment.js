const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
