const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image_url: String,
  genome_data: {
    type: Map,
    of: Number 
  },
  tags: [String],
  calories: { type: Number },
  vegetarian: { type: Boolean, required: true },
  rating: { type: Number, min: 1, max: 5, required: true }
});

module.exports = mongoose.model('Dish', dishSchema);