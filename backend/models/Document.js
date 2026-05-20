const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: [true, 'Document title is required'], trim: true },
  type: {
    type: String,
    required: true,
    enum: ['aadhar', 'pan', 'passport', 'driving_license', 'insurance', 'college', 'certificate', 'other'],
  },
  fileUrl: { type: String, required: true },
  filePublicId: { type: String }, // Cloudinary public_id for deletion
  fileType: { type: String, enum: ['pdf', 'image', 'other'], default: 'image' },
  tags: [{ type: String, lowercase: true, trim: true }],
  expiryDate: { type: Date },
  issueDate: { type: Date },
  documentNumber: { type: String, trim: true },
  issuedBy: { type: String, trim: true },
  notes: { type: String, maxlength: 500 },
  reminderSent: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: true },
}, { timestamps: true });

documentSchema.index({ user: 1, type: 1 });
documentSchema.index({ user: 1, expiryDate: 1 });
documentSchema.index({ title: 'text', tags: 'text', documentNumber: 'text' });

module.exports = mongoose.model('Document', documentSchema);
