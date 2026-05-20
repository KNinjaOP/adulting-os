const HealthRecord = require('../models/HealthRecord');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

exports.getHealthRecords = async (req, res, next) => {
  try {
    const { type, familyMember, search, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };
    if (type) query.type = type;
    if (familyMember) query.familyMember = familyMember;
    if (search) query.$text = { $search: search };

    const total = await HealthRecord.countDocuments(query);
    const records = await HealthRecord.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, count: records.length, total, data: records });
  } catch (err) { next(err); }
};

exports.getHealthRecord = async (req, res, next) => {
  try {
    const record = await HealthRecord.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.createHealthRecord = async (req, res, next) => {
  try {
    let fileUrl = '', filePublicId = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'adulting-os/health');
      fileUrl = result.secure_url;
      filePublicId = result.public_id;
    }
    const medicines = req.body.medicines ? JSON.parse(req.body.medicines) : [];
    const record = await HealthRecord.create({
      ...req.body, user: req.user._id, fileUrl, filePublicId, medicines,
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.updateHealthRecord = async (req, res, next) => {
  try {
    let record = await HealthRecord.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    if (req.file) {
      if (record.filePublicId) await deleteFromCloudinary(record.filePublicId);
      const result = await uploadToCloudinary(req.file.buffer, 'adulting-os/health');
      req.body.fileUrl = result.secure_url;
      req.body.filePublicId = result.public_id;
    }
    if (req.body.medicines && typeof req.body.medicines === 'string') {
      req.body.medicines = JSON.parse(req.body.medicines);
    }
    record = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.deleteHealthRecord = async (req, res, next) => {
  try {
    const record = await HealthRecord.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    if (record.filePublicId) await deleteFromCloudinary(record.filePublicId);
    await record.deleteOne();
    res.json({ success: true, message: 'Health record deleted' });
  } catch (err) { next(err); }
};

exports.getFamilyMembers = async (req, res, next) => {
  try {
    const members = await HealthRecord.distinct('familyMember', { user: req.user._id });
    res.json({ success: true, data: members });
  } catch (err) { next(err); }
};
