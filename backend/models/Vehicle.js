const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  liters: { type: Number },
  costPerLiter: { type: Number },
  totalCost: { type: Number },
  odometer: { type: Number },
  station: { type: String },
});

const serviceHistorySchema = new mongoose.Schema({
  date: { type: Date },
  type: { type: String },
  odometer: { type: Number },
  cost: { type: Number },
  workshop: { type: String },
  notes: { type: String },
  nextServiceDate: { type: Date },
  nextServiceOdometer: { type: Number },
});

const vehicleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['car', 'bike', 'truck', 'other'], required: true },
  make: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  year: { type: Number },
  registrationNumber: { type: String, trim: true, uppercase: true },
  color: { type: String },
  photo: { type: String },

  insurance: {
    provider: { type: String },
    policyNumber: { type: String },
    expiryDate: { type: Date },
    fileUrl: { type: String },
    reminderSent: { type: Boolean, default: false },
  },

  puc: {
    certificateNumber: { type: String },
    expiryDate: { type: Date },
    fileUrl: { type: String },
    reminderSent: { type: Boolean, default: false },
  },

  rc: {
    number: { type: String },
    expiryDate: { type: Date },
    fileUrl: { type: String },
  },

  serviceHistory: [serviceHistorySchema],
  fuelLogs: [fuelLogSchema],

  challans: [{
    date: { type: Date },
    amount: { type: Number },
    reason: { type: String },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  }],

  notes: { type: String, maxlength: 500 },
}, { timestamps: true });

vehicleSchema.index({ user: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
