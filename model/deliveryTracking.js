const mongoose = require('mongoose');
const { Schema } = mongoose;

const deliveryTrackingSchema = new Schema({
  trackingId: {type: String,required: true,unique: true},
  package: {packageId: {type: String,required: false,unique: false},
    seller: {type: String,required: false},
    products: [
      {
        name: { type: String, required: false },
        quantity: { type: Number, required: false },
        price: { type: Number, required: false },
        trackingId: { type: String, required: false },
        agentId: { type: String, required: false },
      }
    ],
    description: {type: String,required: false}},
  deliveryAgentId: {type: String,required: false}, 
  customerId: {type: String,required: false},
  weight: {type: Number,required: false},
  items: {type: Number,required: false},
  nearestInventoryId: {type: String,required: false},
  destination: {latitude: {type: String,required: false},longitude: {type: String,required: false}},
  currentLocation: {type: String,required: false},
  status: {type: String,enum: ['pending', 'Dispatched', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
    required: false
  },
  estimatedDeliveryTime: {type: Date,required: false},
  actualDeliveryTime: {type: Date,required: false},
  createdAt: {type: Date, default: Date.now,required: false},
  updatedAt: {type: Date,default: Date.now,required: false}
});

// deliveryTrackingSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

const DeliveryTracking = mongoose.model('DeliveryTracking', deliveryTrackingSchema);

module.exports = DeliveryTracking;
 