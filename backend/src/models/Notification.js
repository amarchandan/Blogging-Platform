const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String },
  message: { type: String },
  read: { type: Boolean, default: false },
  relatedBlog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
