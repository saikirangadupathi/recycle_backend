const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  latitudes: { type: String, required: false },
  longitudes: { type: String, required: false },
  address: { type: String, required: false },
});

const CurrentOrderSchema = new Schema({
  orderId: { type: String, required: false },
  destination: LocationSchema,
  status: { type: String, required: false },
});

const agents_info = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  contactNumber: { type: String, required: true },
  loginCredentials: { type: Array, required: true },
  pickupHistory: { type: Array, required: false },
  reCommerceOrderHistory: { type: Array, required: false },
  age: { type: String, required: true },
  aadharId: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  vehicleCapacity: { type: String, required: true },
  location: LocationSchema,
  agentGreenPoints: { type: String, required: false },
  agentWallet: { type: String, required: false },
  agentStatus: { type: String, enum: ['active', 'inactive'], required: false },
  type: { type: String, enum: ['pickup', 'e_commerce', 'both'], required: false },
  capacityFilled: { type: String, required: false },
  currentOrders: [CurrentOrderSchema],
});

const agent_info = mongoose.model('agent_info', agents_info);

module.exports = agent_info;
