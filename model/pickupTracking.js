const mongoose = require('mongoose');
const { Schema } = mongoose;

const pickupTrackingSchema = new Schema({
  trackingId: {type: String,required: true,unique: true},
  pickupInfo: {pickupId: {type: String,required: true,unique: true}, 
    customerId: {type: String,required: false},
    address: {type: String,required: true},
    location: {latitude: {type: String,required: false},longitude: {type: String,required: false}},
    scheduledDate: {type: Date,required: true},
    totalWeight: {type: Number,required: true},
  },
  agentId: {type: String,required: false},
  nearestInventoryId: {type: String,required: false},
  currentLocation: {latitude: {type: String,required: false},longitude: {type: String,required: false}},
  status: {type: String,enum: ['Pending', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'],default: 'Pending',required: true},
  estimatedPickupTime: {type: Date,required: false},
  actualPickupTime: {type: Date,required: false},

});


const PickupTracking = mongoose.model('PickupTracking', pickupTrackingSchema);

module.exports = PickupTracking;
