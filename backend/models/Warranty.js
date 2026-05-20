const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productName: { type: String, required: [true, 'Product name is required'], trim: true },
  brand: { type: String, trim: true },
  model: { type: String, trim: true },
  serialNumber: { type: String, trim: true },
  category: {
    type: String,
    enum: ['electronics', 'appliances', 'furniture', 'vehicle_parts', 'clothing', 'other'],
    default: 'electronics',
  },
  purchaseDate: { type: Date, required: true },
  purchasePrice: { type: Number },
  store: { type: String, trim: true },
  warrantyPeriodMonths: { type: Number },
  warrantyEndDate: { type: Date, required: true },
  returnWindowDays: { type: Number, default: 0 },
  returnWindowEnd: { type: Date },
  invoiceUrl: { type: String },
  invoicePublicId: { type: String },
  notes: { type: String, maxlength: 500 },
  reminderSent: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'expired', 'claimed'], default: 'active' },
}, { timestamps: true });

warrantySchema.index({ user: 1, warrantyEndDate: 1 });
warrantySchema.index({ productName: 'text', brand: 'text' });

module.exports = mongoose.model('Warranty', warrantySchema);
