const mongoose = require('mongoose');

const CancellationLogSchema = new mongoose.Schema({
  orderID: {
    type: String, // Reference to the Order document
    required: false,
  },
  sellerId: {
    type: String, // Reference to the Seller (Customer) document
    required: false,
  },
  buyerId: {
    type: String, // Reference to the Scrap Buyer document
    required: false, // This may not exist if the cancellation is by the customer before a buyer is assigned
  },
  cancelledBy: {
    type: String,
    enum: ['Customer', 'ScrapBuyer' ,'DeliveryAgent'], // To store who initiated the cancellation
    required: true,
  },
  cancellationReason: {
    type: String, // Reason for the cancellation
    required: false,
    trim: true,
  },
  cancellationDate: {
    type: Date,
    default: Date.now, // Automatically stores the timestamp when the cancellation occurs
  },
  orderType: {
    type: String, // Type of the order (e.g., 'Pickup', 'Drop-off')
    required: true,
    enum: ['Pickup', 'DropOff'], // Ensuring it follows predefined types
  },
  statusBeforeCancellation: {
    type: String, // Status of the order before cancellation
    required: false,
    enum: ['Pending', 'Accepted', 'In Progress'], // Various possible statuses before cancellation
  },
  previousStatusDate: {
    type: Date, // When the order was in the previous status before cancellation
    required: false,
  },
});

const CancellationsLog = mongoose.model('CancellationLog', CancellationLogSchema);

module.exports = CancellationsLog;
