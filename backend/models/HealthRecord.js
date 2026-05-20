const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  dosage: { type: String, trim: true },
  frequency: { type: String, enum: ['once_daily', 'twice_daily', 'thrice_daily', 'weekly', 'as_needed', 'other'], default: 'once_daily' },
  reminderTimes: [{ type: String }], // e.g. ["08:00", "20:00"]
  startDate: { type: Date },
  endDate: { type: Date },
  notes: { type: String },
  isActive: { type: Boolean, default: true },
});

const healthRecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['prescription', 'report', 'vaccination', 'appointment', 'medicine', 'checkup', 'other'],
    required: true,
  },
  title: { type: String, required: [true, 'Title is required'], trim: true },
  fileUrl: { type: String },
  filePublicId: { type: String },
  date: { type: Date, default: Date.now },
  doctor: { type: String, trim: true },
  hospital: { type: String, trim: true },
  notes: { type: String, maxlength: 1000 },
  tags: [{ type: String, lowercase: true }],
  medicines: [medicineSchema],
  nextAppointment: { type: Date },
  reminderSent: { type: Boolean, default: false },
  familyMember: { type: String, default: 'Self', trim: true },
}, { timestamps: true });

healthRecordSchema.index({ user: 1, type: 1 });
healthRecordSchema.index({ user: 1, date: -1 });
healthRecordSchema.index({ title: 'text', doctor: 'text', tags: 'text' });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
