const express = require('express');
const Cart = require('../models/Cart');
const DishAvailability = require('../models/DishAvailability');
const authMiddleware = require('../auth');
const router = express.Router();

// Add item to cart (auth protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { dish_id, restaurant_id, quantity } = req.body;
    const userId = req.user._id;  // Extract user ID from verified token

    // Check if the combination of dish_id and restaurant_id exists in DishAvailability
    const dishAvailability = await DishAvailability.findOne({ dish_id, restaurant_id });

    if (!dishAvailability) {
      return res.status(400).json({ message: 'Invalid dish and restaurant combination' });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
      // If cart doesn't exist, create a new one
      cart = new Cart({
        user_id: userId,
        items: [{ dish_availability_id: dishAvailability._id, quantity }]
      });
    } else {
      // If cart exists, check if item already exists
      const itemIndex = cart.items.findIndex(item => item.dish_availability_id.toString() === dishAvailability._id.toString());
      if (itemIndex >= 0) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        cart.items.push({ dish_availability_id: dishAvailability._id, quantity });
      }
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get user's cart (auth protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id; // Extract user ID from token

    const cart = await Cart.findOne({ user_id: userId }).populate('items.dish_availability_id');
    
    if (!cart) {
      return res.status(404).json({ message: 'empty cart' });
    }

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Remove item from cart (auth protected)
router.delete('/:dishId/:restaurantId', authMiddleware, async (req, res) => {
  try {
    const { dishId, restaurantId } = req.params;
    const userId = req.user._id;  // Extract user ID from verified token

    // Check if dish availability exists for given dishId and restaurantId
    const dishAvailability = await DishAvailability.findOne({ dish_id: dishId, restaurant_id: restaurantId });

    if (!dishAvailability) {
      return res.status(400).json({ message: 'Invalid dish and restaurant combination' });
    }

    // Find user's cart
    const cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find the item index in cart by dish_availability_id
    const itemIndex = cart.items.findIndex(
      item => item.dish_availability_id.toString() === dishAvailability._id.toString()
    );

    if (itemIndex >= 0) {
      cart.items.splice(itemIndex, 1);  // Remove item from cart
      await cart.save();
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: 'Dish not found in cart' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
