const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
  itemId: { type: String, required: true },
  imageUrl: { type: String, required: false },
  name: { type: String, required: false },
  price: { type: Number, required: false }
});

const categorySchema = new Schema({
  id: { type: String, required: true },
  category: { type: String, required: true },
  items: [itemSchema]
});

const RecyclingMaterial = mongoose.model('RecyclingMaterial', categorySchema);

module.exports = RecyclingMaterial;
