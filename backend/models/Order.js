const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  crops: [
    {
      crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
      quantity: { type: Number, required: true }
    }
  ],
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  orderType: {
    type: String,
    enum: ['Pickup', 'Delivery'],
    required: true
  },
  deliveryAddress: {
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
    contactNumber: { type: String }
  },
  pickupStatus: {
    type: String,
    enum: ['Not Ready', 'Ready'],
    default: 'Not Ready'
  },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema); 