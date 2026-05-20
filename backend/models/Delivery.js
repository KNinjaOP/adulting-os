const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orderId: { type: String, trim: true },
  platform: {
    type: String,
    enum: ['amazon', 'flipkart', 'myntra', 'meesho', 'nykaa', 'zomato', 'swiggy', 'blinkit', 'zepto', 'courier', 'other'],
    default: 'other',
  },
  itemName: { type: String, required: [true, 'Item name is required'], trim: true },
  quantity: { type: Number, default: 1 },
  amount: { type: Number },
  status: {
    type: String,
    enum: ['ordered', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'ordered',
  },
  orderDate: { type: Date, default: Date.now },
  estimatedDelivery: { type: Date },
  deliveredDate: { type: Date },
  trackingNumber: { type: String, trim: true },
  trackingUrl: { type: String },
  deliveryAddress: { type: String },
  notes: { type: String, maxlength: 300 },
  imageUrl: { type: String },
}, { timestamps: true });

deliverySchema.index({ user: 1, status: 1 });
deliverySchema.index({ user: 1, orderDate: -1 });
deliverySchema.index({ itemName: 'text', orderId: 'text' });

module.exports = mongoose.model('Delivery', deliverySchema);
