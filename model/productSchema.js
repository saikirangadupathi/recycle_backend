const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Review Schema
const reviewSchema = new Schema({
  user: { type: String, required: false },
  rating: { type: Number, required: false },
  comment: { type: String, required: false },
  date: { type: Date, default: Date.now }
});

// Attribute Schema
const attributeSchema = new Schema({
  size: { type: String },
  color: { type: String },
  material: { type: String },
  dimensions: { type: String },
  variants: { type: [String], default: [] }
});

// Shipping Schema
const shippingSchema = new Schema({
  weight: { type: String, required: false },
  dimensions: { type: String },
  options: { 
    standard: { type: Boolean, default: true },
    express: { type: Boolean, default: false }
  },
  fulfillment: { type: String }
});

// Performance Schema
const performanceSchema = new Schema({
  views: { type: Number, default: 0 },
  conversionRates: { type: Number, default: 0 },
  salesData: { type: Number, default: 0 }
});

// Compliance Schema
const complianceSchema = new Schema({
  certifications: { type: [String], default: [] },
  regulations: { type: [String], default: [] }
});

// Analytics Schema
const analyticsSchema = new Schema({
  customerBehavior: { type: [String], default: [] },
  rewards: { type: Number, default: 0 },
  advertising: { type: Boolean, default: false }
});

// Inventory Schema
const inventorySchema = new Schema({
  inventoryId: { type: String, required: false },
  stockLevel: { type: Number, required: false },
  thirdPartySellerId: { type: String, required: false }
});

// Brand Schema
const brandSchema = new Schema({
  brandId: { type: String, required: false },
  brandName: { type: String, required: false },
  brandImage: { type: String, required: false }
});

// Product Schema with additional fields for brand, materialsInvolved, and environmental parameters
const productSchema = new Schema({
  id: { type: String, required: false },
  category: { type: String, required: false },
  name: { type: String, required: false },
  price: { type: Number, required: false },
  status: { type: String, required: false },
  ecoFriendly: { type: Boolean, default: false }, 
  greenPoints: { type: Number, default: 0 },
  images: { type: [String], default: [] },
  weight: { type: String, required: false },
  description: { type: [String], default: [] },
  reviews: [reviewSchema],
  discount: { type: Number, default: 0 },
  availableAtInventories: [inventorySchema],      
  attributes: attributeSchema,
  shipping: shippingSchema,
  performance: performanceSchema,
  keywords: { type: [String], default: [] },
  compliance: complianceSchema,
  analytics: analyticsSchema,
  
  brand: brandSchema,
  materialsInvolved: { type: [String], default: [] },
  environmentalParameters: {
    alternateCarbonFootprint: { type: Number, default: 0 },
    alternateEnergyConsumption: { type: Number, default: 0 },
    alternateTreesConsumption: { type: Number, default: 0 },
    carbonFootprint: { type: Number, default: 0 },
    energyConsumption: { type: Number, default: 0 },
    treesConsumption: { type: Number, default: 0 }
  }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
