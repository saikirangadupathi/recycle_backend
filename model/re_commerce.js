const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Define a nested schema for items in the cart
const cartItemSchema = new Schema({
    productId: { type: String, required: false },
    name: { type: String, required: false },
    sellerId: { type: String, required: false },
    quantity: { type: Number, required: false },
    price: { type: Number, required: false },
    status: { type: String, enum: ['ordered', 'shipped', 'delivered', 'returned', 'refunded', 'pending', 'resolved', 'unresolved', 'in progress','orderplaced'], required: false },
    returnReason: { type: String },
    refundAmount: { type: Number }
  });
  
  // Define a nested schema for complaints and customer support
  const complaintSchema = new Schema({
    complaintId: { type: String, required: false },
    userId: { type: String, required: false },
    issue: { type: String, required: false },
    status: { type: String, enum: ['pending', 'resolved', 'unresolved'], required: false },
    date: { type: Date, default: Date.now },
    resolution: { type: String }
  });

  const locationSchema = new Schema({
    lat: { type: String, required: false },
    lng: { type: String, required: false },
    address: { type: String, required: false }
  });
  
  // Define the main schema for online orders
  const onlineOrdersSchema = new Schema({
    id: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    date: { type: Date, required: true },
    fulfillmentDate: { type: Date },
    cart: { type: [cartItemSchema], required: true },
    location: { type: [locationSchema], required: false },
    totalPrice: { type: Number, required: false },
    giftCards: { type: [String], required: false },
    status: { type: String, enum: ['processing', 'shipped', 'delivered', 'completed', 'cancelled', 'pending', 'resolved', 'unresolved', 'in progress', 'orderplaced'], required: false },
    complaints: { type: [complaintSchema], default: [] },
    trackingNumber: { type: String },
    greenPoints: { type: Number, required: false },
    deliveryDate: { type: Date },
    paymentMethod: { type: String, enum: ['upi','credit_card', 'debit_card', 'cod'], required: false },
    deliveryInstructions: { type: String },
    orderHistory: [
      {
        status: { type: String, required: false },
        date: { type: Date, default: Date.now },
        remarks: { type: String }
      }
    ]
  }, { timestamps: true });

const reCommerceOrders = mongoose.model('re_commerce_orders', onlineOrdersSchema);

module.exports = reCommerceOrders;
