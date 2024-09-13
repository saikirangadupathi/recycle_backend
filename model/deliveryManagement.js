const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Location Schema
const LocationSchema = new Schema({
    coordinates: { type: String, required: true },
    address: { type: String, required: true }
});

// Order Schema
const OrderSchema = new Schema({
    orderId: { type: String, required: false, unique: true },
    customerId: { type: String, required: false },
    destination: LocationSchema,
    status: { type: String, enum: ['pending', 'in-transit', 'completed'], default: 'pending' }
});

// Pickup Order Schema
const PickupOrderSchema = new Schema({
    pickupId: { type: String, required: false, unique: true },
    customerId: { type: String, required: false },
    destination: LocationSchema,
    status: { type: String, enum: ['pending', 'in-transit', 'completed'], default: 'pending' }
});

// Fleet Schema
const FleetSchema = new Schema({
    agentId: { type: String, required: false, unique: true },
    name: { type: String, required: false },
    status: { type: String, enum: ['active', 'inactive'], required: false },
    type: { type: String, enum: ['pickup', 'e-commerce'], required: false },
    currentLocation: LocationSchema,
    totalCapacity: { type: Number, required: false},
    capacityFilled: { type: Number, default: 0 },
    currentOrders: [{
        orderId: { type: String, required: false },
        destination: LocationSchema
    }]
});

// Third Party Seller Schema
const ThirdPartySellerSchema = new Schema({
    sellerId: { type: String, required: false, unique: true },
    name: { type: String, required: false },
    status: { type: String, enum: ['active', 'inactive'], required: false },
    currentOrders: [{
        orderId: { type: String, required: false },
        destination: LocationSchema
    }]
});

// Main Delivery Management Schema
const DeliveryManagementSchema = new Schema({
    fleets: [FleetSchema],
    thirdPartySellers: [ThirdPartySellerSchema],
    orders: [OrderSchema],
    pickupOrders: [PickupOrderSchema]
}, { timestamps: true });

// Creating Indexes for Geospatial Queries
DeliveryManagementSchema.index({ 'fleets.currentLocation': '2dsphere' });
DeliveryManagementSchema.index({ 'thirdPartySellers.currentOrders.destination': '2dsphere' });
DeliveryManagementSchema.index({ 'orders.destination': '2dsphere' });
DeliveryManagementSchema.index({ 'pickupOrders.destination': '2dsphere' });

const DeliveryManagement = mongoose.model('DeliveryManagement', DeliveryManagementSchema);

module.exports = DeliveryManagement;
 