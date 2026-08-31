const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: String,
  image: String,
}, { timestamps: true });

CategorySchema.pre('validate', function (next) {
  if (!this.slug && this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
