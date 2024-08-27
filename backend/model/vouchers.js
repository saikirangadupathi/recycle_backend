const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  id: { type: String, required: false },
  name: { type: String, required: false },
  code: { type: String, required: false },
  imageUrl: { type: String, required: false },
  description: { type: String, required: false },
  greenPoints: { type: Number, required: false },
  expiryDate: { type: Date, required: false },
  category: { type: String, required: false },
  stock: { type: Number, required: false },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
