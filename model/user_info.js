const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Address Schema
const addressSchema = new Schema({
    addressId : { type: String, required: false },
    name: { type: String, required: false }, // Name associated with the address
    addressLine1: { type: String, required: false },
    addressLine2: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    postalCode: { type: String, required: false },
    country: { type: String, required: false },
    postOffice: { type: String, required: false }, // Post office associated with the address (if applicable)
    isPrimary: { type: Boolean, default: false }, // Is this the primary address
    addressType: { 
        type: String, 
        enum: ['home', 'office', 'shop', 'friends', 'others'], // predefined address types
        required: false 
    },
    location: {
        latitude: { type: String, required: false},
        longitude: { type: String, required: false},
    }
});

// Login Credential Schema
const loginCredentialSchema = new Schema({
    username: { type: String, required: false},
    passwordHash: { type: String, required: false},
    lastLogin: { type: Date, required: false },
    failedLoginAttempts: { type: Number, default: 0 }
});

// Order History Schema
const orderHistorySchema = new Schema({
    orderId: { type: String, required: false},
    productIds: [{ type: String, required: false}],
    orderDate: { type: Date, required: false},
    deliveryDate: { type: Date, required: false },
    orderValue: { type: Number, required: false},
    paymentMethod: { type: String, required: false},
    deliveryAddress: { type: String, required: false},
    orderStatus: { type: String, enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'], required: false}
});

// Pickup History Schema
const pickupHistorySchema = new Schema({
    pickupId: { type: String, required: false},
    items: [{
        productId: { type: String, required: false },
        quantity: { type: Number, required: false },
    }],
    pickupDate: { type: Date, required: false},
    status: { type: String, enum: ['Scheduled','Pending', 'Completed'], required: false}
});

// Product Review Schema
const productReviewSchema = new Schema({
    productId: { type: String, required: false},
    rating: { type: Number, required: false, min: 1, max: 5 },
    reviewText: { type: String, required: false },
    reviewDate: { type: Date, required: false, default: Date.now },
    verifiedPurchase: { type: Boolean, default: false }
});

// Wishlist Schema
const wishlistSchema = new Schema({
    productId: { type: String, required: false},
    addedDate: { type: Date, required: false, default: Date.now }
});

// Browsing History Schema
const browsingHistorySchema = new Schema({
    productId: { type: String, required: false},
    viewedDate: { type: Date, required: false, default: Date.now },
    duration: { type: Number, required: false }  // Time spent on product page in seconds
});

// Cart Schema
const cartItemSchema = new Schema({
    productId: { type: String, required: false},
    quantity: { type: Number, required: false},
    dateAdded: { type: Date, required: false, default: Date.now }
});

// Recommended Products Schema
const recommendedProductSchema = new Schema({
    productId: { type: String, required: true },
    recommendationScore: { type: Number, required: false }
});

// Payment Method Schema
const paymentMethodSchema = new Schema({
    methodType: { type: String, enum: ['Credit Card', 'Debit Card', 'PayPal', 'Net Banking', 'Wallet'], required: false},
    cardNumber: { type: String, required: false }, // Encrypted or tokenized for security
    expiryDate: { type: String, required: false },
    billingAddress: { type: addressSchema, required: false }
});

// Main User Schema
const users_info = new Schema({
    id: { type: String, required: false},
    name: { type: String, required: false},
    email: { type: String, required: false, unique: false},
    contactNumber: { type: String, required: false},
    dateOfBirth: { type: Date, required: false }, // For age-based segmentation
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: false }, // Demographics
    loginCredentials: { type: Array, required: true },
    addresses: { type: [addressSchema], required: false }, // Multiple addresses
    pickupHistory: { type: [pickupHistorySchema], required: false },
    reCommerceOrderHistory: { type: [orderHistorySchema], required: false },
    pickupSavedCart:  { type: [String], required: false },
    shoppingSavedCart: { type: [cartItemSchema], required: false }, // Cart items
    couponsHistory: { type: [String], required: false },
    greenpoints: { type: Number, required: false, default: 0 },
    wallet: { type: String, required: false, default: 0 }, // Numeric wallet balance
    recommendedProducts: { type: [recommendedProductSchema], required: false }, // Personalized recommendations
    accountCreationDate: { type: Date, required: false, default: Date.now }, // Track account age
    lastUpdated: { type: Date, required: false, default: Date.now },
    isActive: { type: Boolean, required: false, default: false}, // To track if the user is still active
    productReviews: { type: [productReviewSchema], required: false }, // User product reviews
    wishlist: { type: [wishlistSchema], required: false }, // User wishlist
    browsingHistory: { type: [browsingHistorySchema], required: false }, // Track user browsing history
    paymentMethods: { type: [paymentMethodSchema], required: false }, // Stored payment methods for faster checkout
    totalSpent: { type: Number, required: false, default: 0 }, // Track total amount spent by the user
    averageOrderValue: { type: Number, required: false, default: 0 }, // Track user's average order value
    frequencyOfPurchase: { type: Number, required: false, default: 0 }, // Average time between purchases
    loyaltyTier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], required: false }, // Loyalty program tiers
});

const user_info = mongoose.model('user_info', users_info);

module.exports = user_info;
