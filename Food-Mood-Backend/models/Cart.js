const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [
    {
      dish_availability_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DishAvailability', required: true },
      quantity: { type: Number, required: true, min: 1 }
    }
  ]
});

module.exports = mongoose.model('Cart', cartSchema);
