const Receipt = require('../models/Receipt');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

exports.getReceipts = async (req, res, next) => {
  try {
    const { category, folder, search, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };
    if (category) query.category = category;
    if (folder) query.folder = folder;
    if (search) query.$text = { $search: search };

    const total = await Receipt.countDocuments(query);
    const receipts = await Receipt.find(query).sort({ date: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const totalAmount = await Receipt.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({ success: true, count: receipts.length, total, data: receipts, totalAmount: totalAmount[0]?.total || 0 });
  } catch (err) { next(err); }
};

exports.getReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findOne({ _id: req.params.id, user: req.user._id });
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
    res.json({ success: true, data: receipt });
  } catch (err) { next(err); }
};

exports.createReceipt = async (req, res, next) => {
  try {
    let fileUrl = '', filePublicId = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'adulting-os/receipts');
      fileUrl = result.secure_url;
      filePublicId = result.public_id;
    }
    const receipt = await Receipt.create({
      ...req.body, user: req.user._id, fileUrl, filePublicId,
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
    });
    res.status(201).json({ success: true, data: receipt });
  } catch (err) { next(err); }
};

exports.updateReceipt = async (req, res, next) => {
  try {
    let receipt = await Receipt.findOne({ _id: req.params.id, user: req.user._id });
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
    if (req.file) {
      if (receipt.filePublicId) await deleteFromCloudinary(receipt.filePublicId);
      const result = await uploadToCloudinary(req.file.buffer, 'adulting-os/receipts');
      req.body.fileUrl = result.secure_url;
      req.body.filePublicId = result.public_id;
    }
    if (req.body.tags && typeof req.body.tags === 'string') req.body.tags = req.body.tags.split(',').map(t => t.trim());
    receipt = await Receipt.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: receipt });
  } catch (err) { next(err); }
};

exports.deleteReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findOne({ _id: req.params.id, user: req.user._id });
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
    if (receipt.filePublicId) await deleteFromCloudinary(receipt.filePublicId);
    await receipt.deleteOne();
    res.json({ success: true, message: 'Receipt deleted' });
  } catch (err) { next(err); }
};

exports.getFolders = async (req, res, next) => {
  try {
    const folders = await Receipt.distinct('folder', { user: req.user._id });
    res.json({ success: true, data: folders });
  } catch (err) { next(err); }
};
