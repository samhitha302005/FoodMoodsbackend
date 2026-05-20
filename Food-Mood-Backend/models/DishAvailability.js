const mongoose = require('mongoose');

const dishAvailabilitySchema = new mongoose.Schema({
  dish_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  price: { type: Number, required: true }
});

module.exports = mongoose.model('DishAvailability', dishAvailabilitySchema);