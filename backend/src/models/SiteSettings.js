const mongoose = require('mongoose');

const SiteSettingsSchema = new mongoose.Schema({
  siteName: String,
  logo: String,
  favicon: String,
  description: String,
  socialLinks: Object,
  contactEmail: String,
  seoDefaults: Object,
  themeSettings: Object,
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);
