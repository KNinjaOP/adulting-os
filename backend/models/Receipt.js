const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: [true, 'Title is required'], trim: true },
  storeName: { type: String, trim: true },
  amount: { type: Number },
  currency: { type: String, default: '₹' },
  date: { type: Date, default: Date.now },
  category: {
    type: String,
    enum: ['electronics', 'food', 'clothing', 'health', 'education', 'travel', 'utilities', 'other'],
    default: 'other',
  },
  fileUrl: { type: String },
  filePublicId: { type: String },
  tags: [{ type: String, lowercase: true, trim: true }],
  folder: { type: String, default: 'General', trim: true },
  notes: { type: String, maxlength: 500 },
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'netbanking', 'other'], default: 'other' },
}, { timestamps: true });

receiptSchema.index({ user: 1, date: -1 });
receiptSchema.index({ user: 1, folder: 1 });
receiptSchema.index({ title: 'text', storeName: 'text', tags: 'text' });

module.exports = mongoose.model('Receipt', receiptSchema);
