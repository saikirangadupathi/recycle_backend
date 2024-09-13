const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orders = new Schema({
    Id: { type: String, required: true },
    customerId: { type: String, required: true },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    images: { type: [String], required: false },
    schedulePickup: { type: String, required: true },
    totalWeight: { type: String, required: true },
    cart: { type: Array, required: true },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        address: { type: String, required: true }
    },
    status: { type: String, required: false },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' }, 
    pickupAgentId: { type: String, required: false  },
    pricing: {
        basePrice: { type: Number, required: false },
        discount: { type: Number, default: 0 },
        totalPrice: { type: Number, required: false }
    },
    requestedPickupAgentId: { type: [String], required: false  },
    receivedInventoryId: { type: String, required: false },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' }, // New field for payment status
    orderNotes: { type: String }, // New field for additional order notes
    customerFeedback: { // New field for customer feedback
        rating: { type: Number, min: 1, max: 5, required: false },
        comments: { type: String, required: false  }
    },

}, { timestamps:  false });

const scrap_orders = mongoose.model('scrap_orders', orders);

module.exports = scrap_orders;
