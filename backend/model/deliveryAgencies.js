const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeliveryAgencySchema = new Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  contactInfo: { type: String, required: true },
  serviceAreas: { type: [String], required: true },
  onTimeDeliveryRate: { type: Number, required: true },
  averageDeliveryTime: { type: Number, required: true },
  deliveryAccuracy: { type: Number, required: true },
  customerRatings: { type: Number, required: true },
  complaints: { type: Number, required: true },
  averageDeliveryTimeData: { 
    type: [ 
      {
        date: { type: Date, required: true },
        time: { type: Number, required: true }
      }
    ], 
    required: false 
  },
  onTimeDeliveryRateData: { 
    type: [ 
      {
        date: { type: Date, required: true },
        rate: { type: Number, required: true }
      }
    ], 
    required: false 
  },
  pickupTimeData: { 
    type: [ 
      {
        category: { type: String, required: true },
        value: { type: Number, required: true }
      }
    ], 
    required: false 
  },
  orderTracking: { type: String, required: false },
  deliveryCostData: { 
    type: [ 
      {
        date: { type: Date, required: true },
        cost: { type: Number, required: true }
      }
    ], 
    required: false 
  },
  costVariationsData: { 
    type: [ 
      {
        date: { type: Date, required: true },
        cost: { type: Number, required: true }
      }
    ], 
    required: false 
  },
  rating: { type: Number, required: false },
  reviews: { type: [String], required: false },
  complaintDetails: { type: [String], required: false }
});

const DeliveryAgency = mongoose.model('DeliveryAgency', DeliveryAgencySchema);

module.exports = DeliveryAgency;
