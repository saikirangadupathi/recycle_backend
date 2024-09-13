const mongoose = require('mongoose');

// Sub-schema for items specific to 'scrap' type inventory
const itemSchema = new mongoose.Schema({
  itemid: { type: String, required: false },
  name: { type: String, required: false },
  weight: { type: Number, required: false },
  image: { type: String, required: false }, // URL to the image
  price: { type: Number, required: false },
  category:{ type: String, required: false },
  AmntPaid: { type: Number, required: false },
  dateAdded: { type: Date, default: Date.now },
  remarks: { type: String, required: false },
});

// Sub-schema for e-commerce products stored in 'e_commerce' type inventory
const eCommerceProductSchema = new mongoose.Schema({
  productId: { type: String, required: false },
  name: { type: String, required: false },
  quantity: { type: Number, required: false },
  price: { type: Number, required: false },
  imageUrl: { type: [String], required: false }, // URL to the image
  dateAdded: { type: Date, default: Date.now },
  remarks: { type: String, required: false },
});

// Schema for 'scrap' type inventory
const scrapInventorySchema = new mongoose.Schema({
  items: [itemSchema],
  totalCapacity: { type: Number, required: false },
  totalCapacityFilled: { type: Number, required: false },
  totalInventoryValue: { type: Number, required: false },
  lastUpdated: { type: Date, default: Date.now },
  remarks: { type: String, required: false },
});

// Schema for 'e_commerce' type inventory
const eCommerceInventorySchema = new mongoose.Schema({
  products: [eCommerceProductSchema],
  totalCapacity: { type: Number, required: false },
  totalCapacityFilled: { type: Number, required: false },
  totalInventoryValue: { type: Number, required: false },
  lastUpdated: { type: Date, default: Date.now },
  remarks: { type: String, required: false },
});

// Main inventory schema
const inventorySchema = new mongoose.Schema({
  id: { type: String, required: false },
  name: { type: String, required: false },
  inventoryManager: { type: String, required: false },
  type: { type: String, required: false, enum: ['scrap', 'e_commerce', 'both'] },
  location: {
    latitude: { type: String, required: false },
    longitude: { type: String, required: false },
    address: { type: String, required: false },
  },
  scrap: { type: scrapInventorySchema, required: function() { return this.type === 'scrap' || this.type === 'both'; } },
  e_commerce: { type: eCommerceInventorySchema, required: function() { return this.type === 'e_commerce' || this.type === 'both'; } },
  totalCapacity: { type: Number, required: function() { return this.type === 'both'; } },
  totalCapacityFilled: { type: Number, required: function() { return this.type === 'both'; } },
  totalInventoryValue: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
  remarks: { type: String, required: false },
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;

