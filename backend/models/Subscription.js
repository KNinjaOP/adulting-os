const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: [true, 'Subscription name is required'], trim: true },
  logo: { type: String, default: '' },
  cost: { type: Number, required: [true, 'Cost is required'], min: 0 },
  currency: { type: String, default: '₹' },
  cycle: { type: String, enum: ['monthly', 'quarterly', 'yearly', 'weekly'], default: 'monthly' },
  category: {
    type: String,
    enum: ['entertainment', 'fitness', 'productivity', 'utilities', 'shopping', 'food', 'other'],
    default: 'other',
  },
  startDate: { type: Date, required: true },
  renewalDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },
  autoRenew: { type: Boolean, default: true },
  website: { type: String },
  notes: { type: String, maxlength: 500 },
  reminderDaysBefore: { type: Number, default: 3 },
  reminderSent: { type: Boolean, default: false },
  lastUsed: { type: Date },
}, { timestamps: true });

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ user: 1, renewalDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
