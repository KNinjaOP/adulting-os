const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['document_expiry', 'subscription_renewal', 'warranty_expiry', 'deadline', 'medicine', 'vehicle_renewal', 'delivery', 'general'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  linkedModule: { type: String },
  linkedId: { type: mongoose.Schema.Types.ObjectId },
  actionUrl: { type: String },
  expiresAt: { type: Date },
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
