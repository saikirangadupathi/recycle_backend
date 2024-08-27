const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const users_info = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    contactNumber: {type: String, required: true },
    loginCredentials: { type: Array, required: true },
    pickupHistory: { type: Array, required: false },
    reCommerceOrderHistory: { type: Array, required: false },
    pickupSavedCart:  { type: Array, required: false },
    shoppingSavedCart: { type: Array, required: false },
    couponsHistory: { type: Array, required: false },
    greenpoints: { type: Number, required: false },
    wallet: { type: String, required: false }
});

const user_info = mongoose.model('user_info', users_info);

module.exports = user_info;
