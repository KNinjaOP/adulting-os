const mongoose = require('mongoose');

const deadlineSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: [true, 'Title is required'], trim: true },
  description: { type: String, maxlength: 500 },
  dueDate: { type: Date, required: [true, 'Due date is required'] },
  category: {
    type: String,
    enum: ['education', 'finance', 'health', 'government', 'work', 'personal', 'vehicle', 'other'],
    default: 'personal',
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['pending', 'completed', 'overdue', 'cancelled'], default: 'pending' },
  isRecurring: { type: Boolean, default: false },
  recurrenceRule: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly', null], default: null },
  reminderDaysBefore: { type: Number, default: 3 },
  reminderSent: { type: Boolean, default: false },
  completedAt: { type: Date },
  tags: [{ type: String, lowercase: true }],
  linkedModule: { type: String }, // 'document', 'vehicle', 'subscription' etc
  linkedId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

deadlineSchema.index({ user: 1, dueDate: 1 });
deadlineSchema.index({ user: 1, status: 1 });
deadlineSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Deadline', deadlineSchema);
