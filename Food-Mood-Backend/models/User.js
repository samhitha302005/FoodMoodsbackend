const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  liked_dishes: { type: [String], default: [] },
  disliked_dishes: { type: [String], default: [] },
  pastorders: [
    {
      dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish' },
      restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
      quantity: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      date: { type: Date, required: true }
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
