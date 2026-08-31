const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
}, { timestamps: true });

RatingSchema.index({ blog: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);
