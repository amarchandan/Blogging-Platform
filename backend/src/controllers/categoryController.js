const Category = require('../models/Category');

exports.list = async (req, res, next) => {
  try {
    const items = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    const cat = await Category.create({ name, description, image });
    res.status(201).json({ success: true, data: cat });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: cat });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};
