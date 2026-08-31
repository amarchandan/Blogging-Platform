const path = require('path');
const fs = require('fs');
const { cloudinary, enabled } = require('../config/cloudinary');

exports.uploadImage = async (req, res, next) => {
  try {
    if (req.body.imageUrl) {
      // accept external URL
      return res.json({ success: true, data: { url: req.body.imageUrl } });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
    const localPath = path.relative(process.cwd(), req.file.path);
    if (enabled) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'blog' });
      // remove local file
      try { fs.unlinkSync(req.file.path); } catch (e) {}
      return res.json({ success: true, data: { url: result.secure_url } });
    }
    // return local URL path
    const url = `${req.protocol}://${req.get('host')}/uploads/${path.basename(req.file.path)}`;
    res.json({ success: true, data: { url } });
  } catch (err) { next(err); }
};
