const Document = require('../models/Document');
const Notification = require('../models/Notification');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

// @desc   Get all documents
// @route  GET /api/v1/documents
exports.getDocuments = async (req, res, next) => {
  try {
    const { search, type, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };

    if (type) query.type = type;
    if (search) query.$text = { $search: search };

    const total = await Document.countDocuments(query);
    const docs = await Document.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, count: docs.length, total, pages: Math.ceil(total / limit), data: docs });
  } catch (err) { next(err); }
};

// @desc   Get single document
// @route  GET /api/v1/documents/:id
exports.getDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// @desc   Create document
// @route  POST /api/v1/documents
exports.createDocument = async (req, res, next) => {
  try {
    let fileUrl = '', filePublicId = '';

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'adulting-os/documents');
      fileUrl = result.secure_url;
      filePublicId = result.public_id;
    }

    const doc = await Document.create({
      ...req.body,
      user: req.user._id,
      fileUrl,
      filePublicId,
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
    });

    // Create notification if expiry is set and within 30 days
    if (doc.expiryDate) {
      const daysLeft = Math.ceil((new Date(doc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 30) {
        await Notification.create({
          user: req.user._id,
          type: 'document_expiry',
          title: 'Document Expiring Soon',
          message: `Your ${doc.title} expires in ${daysLeft} days`,
          priority: daysLeft <= 7 ? 'high' : 'medium',
          linkedModule: 'documents',
          linkedId: doc._id,
        });
      }
    }

    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// @desc   Update document
// @route  PUT /api/v1/documents/:id
exports.updateDocument = async (req, res, next) => {
  try {
    let doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    if (req.file) {
      if (doc.filePublicId) await deleteFromCloudinary(doc.filePublicId);
      const result = await uploadToCloudinary(req.file.buffer, 'adulting-os/documents');
      req.body.fileUrl = result.secure_url;
      req.body.filePublicId = result.public_id;
    }

    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(t => t.trim());
    }

    doc = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// @desc   Delete document
// @route  DELETE /api/v1/documents/:id
exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    if (doc.filePublicId) await deleteFromCloudinary(doc.filePublicId);
    await doc.deleteOne();
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) { next(err); }
};
