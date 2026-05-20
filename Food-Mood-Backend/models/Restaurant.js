const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine_type: { type: String, required: true },
  rating: { type: Number },
  image_url: String
});

module.exports = mongoose.model('Restaurant', restaurantSchema);