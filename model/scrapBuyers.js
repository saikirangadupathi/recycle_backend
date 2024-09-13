const mongoose = require('mongoose');

const ScrapBuyerSchema = new mongoose.Schema({
  scrapBuyerId: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  profileImage: {
    type: String,
    required: false,
  },
  contact: {
    phone: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
  },
  businessName: {
    type: String,
    required: false,
  },
  businessPanId: {
    type: String,
    required: false,
  },
  location: {
    address: {
      type: String,
      required: false,
    },
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
  },
  serviceAreas: [{
    type: String, // Names or codes of areas they serve
  }],
  acceptedMaterials: [{
    category: {
      type: String, // E.g., "Plastic", "Metal", "Paper", etc.
      required: true,
    },
    items: [{
      itemId: {
        type: String, // Unique identifier for the item
        required: true,
      },
      imageUrl: {
        type: String, // URL of the item image
        required: false,
      },
      name: {
        type: String, // Name of the item
        required: true,
      },
      buyerPrice: {
        type: Number, // Price per unit weight (e.g., per kg)
        required: true,
      },
    }]
  }],
  inventory:  [{
    category: {
      type: String, // Must match the category in acceptedMaterials
      required: true,
    },
    items: [{
      itemId: {
        type: String, // Must match the itemId in acceptedMaterials
        required: true,
      },
      name: {
        type: String, // Must match the name in acceptedMaterials
        required: true,
      },
      quantity: {
        type: Number, // Quantity available in stock
        required: true,
        default: 0,
      },
      paidAmount: {
        type: Number, // Quantity available in stock
        required: true,
        default: 0,
      },
    }]
  }],
  pricing: [{
    materialType: String,
    pricePerKg: Number,
  }],
  operationalHours: {
    type: String,
    required: false,
  },
  reviews: [{
    customerId: {
      type: String,
      required: false,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  currentOrders: [{
    orderId: {
      type: String,
      required: false,
    },
    pickupDate: {
      type: Date,
    },
    status: {
      type: String, // E.g., "Pending", "In Progress", "Scheduled"
    },
  }],
  completedOrders: [{
    orderId: {
      type: String,
      required: false,
    },
    completedDate: {
      type: Date,
    },
    totalWeight: {
      type: Number, // Total weight of the materials in the order
    },
    totalPrice: {
      type: Number, // Total amount paid for the completed order
    },
  }],
  cancelledOrders: [{
    orderId: {
      type: String,
      required: false,
    },
    cancelledDate: {
      type: Date,
      default: Date.now, // Date the order was cancelled
    },
    reason: {
      type: String, // Reason for cancellation
    },
  }],
  requestedOrders: [{
    orderId: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['accepted', 'declined', 'cancelled'],
      required: true,
    },
    requestDate: {
      type: Date,
      default: Date.now, // Date the request was made
    },
  }],
  availableStatus: {
    type: Boolean,
    default: true, // Indicates if they are currently available for pickups
  },
  paymentMethods: [{
    type: String, // E.g., "Cash", "Bank Transfer", "Mobile Payment"
  }],
  wallet: {
    balance: {
      type: Number,
      default: 0, // Wallet balance for transactions on the platform
    },
    transactions: [{
      transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
      },
      date: {
        type: Date,
        default: Date.now,
      },
      amount: {
        type: Number,
      },
      type: {
        type: String, // "Credit" or "Debit"
      },
    }],
  },
  remarks: [{
    remarkText: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // The admin or system user who added the remark
    },
  }],
  registeredDate: {
    type: Date,
    default: Date.now,
  },
  platformRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3, // Platform's internal rating for the buyer
  },

  // New Fields for Recyclable Selling Platform
  postedOffers: [{
    offerId: {
      type: String,
      required: false,
    },
    materialType: {
      type: String,
      required: false,
    },
    quantityAvailable: {
      type: Number, // In units (e.g., tons, kg)
      required: false,
    },
    pricePerUnit: {
      type: Number,
      required: false,
    },
    location: {
      address: {
        type: String,
        required: false,
      },
      latitude: {
        type: Number,
        required: false,
      },
      longitude: {
        type: Number,
        required: false,
      },
    },
    description: {
      type: String,
      required: false,
    },
    images: [{
      type: String, // URLs of uploaded images
    }],
    contactInfo: {
      phone: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
    },
    views: {
      type: Number,
      default: 0,
    },
    comments: [{
      commenterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the user who commented
      },
      commentText: {
        type: String,
        required: false,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    }],
    status: {
      type: String,
      enum: ['Active', 'Sold', 'Pending', 'Expired'],
      default: 'Active',
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
  }],
});

const ScrapBuyer = mongoose.model('ScrapBuyer', ScrapBuyerSchema);

module.exports = ScrapBuyer;

