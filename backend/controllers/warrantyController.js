const Warranty = require('../models/Warranty');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

exports.getWarranties = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;
    const query = { user: req.user._id };
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const warranties = await Warranty.find(query).sort({ warrantyEndDate: 1 });
    res.json({ success: true, count: warranties.length, data: warranties });
  } catch (err) { next(err); }
};

exports.getWarranty = async (req, res, next) => {
  try {
    const warranty = await Warranty.findOne({ _id: req.params.id, user: req.user._id });
    if (!warranty) return res.status(404).json({ success: false, message: 'Warranty not found' });
    res.json({ success: true, data: warranty });
  } catch (err) { next(err); }
};

exports.createWarranty = async (req, res, next) => {
  try {
    let invoiceUrl = '', invoicePublicId = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'adulting-os/warranties');
      invoiceUrl = result.secure_url;
      invoicePublicId = result.public_id;
    }
    const warranty = await Warranty.create({ ...req.body, user: req.user._id, invoiceUrl, invoicePublicId });
    res.status(201).json({ success: true, data: warranty });
  } catch (err) { next(err); }
};

exports.updateWarranty = async (req, res, next) => {
  try {
    let warranty = await Warranty.findOne({ _id: req.params.id, user: req.user._id });
    if (!warranty) return res.status(404).json({ success: false, message: 'Warranty not found' });
    if (req.file) {
      if (warranty.invoicePublicId) await deleteFromCloudinary(warranty.invoicePublicId);
      const result = await uploadToCloudinary(req.file.buffer, 'adulting-os/warranties');
      req.body.invoiceUrl = result.secure_url;
      req.body.invoicePublicId = result.public_id;
    }
    warranty = await Warranty.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: warranty });
  } catch (err) { next(err); }
};

exports.deleteWarranty = async (req, res, next) => {
  try {
    const warranty = await Warranty.findOne({ _id: req.params.id, user: req.user._id });
    if (!warranty) return res.status(404).json({ success: false, message: 'Warranty not found' });
    if (warranty.invoicePublicId) await deleteFromCloudinary(warranty.invoicePublicId);
    await warranty.deleteOne();
    res.json({ success: true, message: 'Warranty deleted' });
  } catch (err) { next(err); }
};
