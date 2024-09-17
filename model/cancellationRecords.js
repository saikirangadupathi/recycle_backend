const mongoose = require('mongoose');

const CancellationLogSchema = new mongoose.Schema({
  orderID: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Order document
    required: true,
    ref: 'Order', // Reference to the Order collection
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Seller (Customer) document
    required: true,
    ref: 'Customer', // Reference to the Customer collection
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Scrap Buyer document
    required: false, // This may not exist if the cancellation is by the customer before a buyer is assigned
    ref: 'ScrapBuyer', // Reference to the ScrapBuyer collection
  },
  cancelledBy: {
    type: String,
    enum: ['Customer', 'ScrapBuyer'], // To store who initiated the cancellation
    required: true,
  },
  cancellationReason: {
    type: String, // Reason for the cancellation
    required: true,
    trim: true,
  },
  cancellationDate: {
    type: Date,
    default: Date.now, // Automatically stores the timestamp when the cancellation occurs
  },
  orderType: {
    type: String, // Type of the order (e.g., 'Pickup', 'Drop-off')
    required: true,
    enum: ['Pickup', 'Drop-off'], // Ensuring it follows predefined types
  },
  statusBeforeCancellation: {
    type: String, // Status of the order before cancellation
    required: true,
    enum: ['Pending', 'Accepted', 'In Progress', 'Completed'], // Various possible statuses before cancellation
  },
  previousStatusDate: {
    type: Date, // When the order was in the previous status before cancellation
    required: true,
  },
});

module.exports = mongoose.model('CancellationLog', CancellationLogSchema);

