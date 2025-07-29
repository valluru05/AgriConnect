const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  discountPercent: { type: Number }, // e.g., 10 for 10%
  harvestDate: { type: Date, required: true },
  photos: [{ type: String }],
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Crop', cropSchema); 