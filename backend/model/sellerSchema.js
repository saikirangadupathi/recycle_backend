const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  salesVolume: { type: Number, required: true },
  revenue: { type: Number, required: true },
  returnRate: { type: Number, required: true },
  customerRatings: { type: Number, required: true },
  customerComplaints: { type: Number, required: true },
  productViews: { type: Number, required: true },
  conversionRate: { type: Number, required: true },
  stockLevels: { type: Number, required: true },
  orderProcessingTime: { type: Number, required: true },
  shippingTime: { type: Number, required: true },
  fulfillmentAccuracy: { type: Number, required: true },
  commissionEarned: { type: Number, required: true },
  payoutTimelines: { type: Number, required: true }
});

module.exports = mongoose.model('Seller', sellerSchema);
