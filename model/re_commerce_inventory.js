const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inventoryItems = new Schema({
    electronics: { type: Array, required: true },
    Fashion: { type: Array, required: true },
    Home: { type: Array, required: true },
    Beauty: { type: Array, required: true }

});

const re_commerce_inventory = mongoose.model('re_commerce_inventory', inventoryItems);

module.exports = re_commerce_inventory;