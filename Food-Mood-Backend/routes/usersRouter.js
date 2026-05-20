const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../auth');
const jwt = require('jsonwebtoken');
const { generatePastOrders, getRecommendedDishes } = require('../utils/orderUtils');
const { hashPassword, comparePasswords } = require('../utils/authUtils');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const router = express.Router();

const secret_key = process.env.JWT_SECRET; 

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Create new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const password_hash = await hashPassword(password); 

    const pastorders = await generatePastOrders();

    const newUser = new User({
      name,
      email,
      password_hash,  
      liked_tags: [],
      disliked_tags: [],
      pastorders,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await comparePasswords(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ _id: user._id }, secret_key, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get user's past orders
router.get('/pastorders', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('pastorders.dishId')
      .populate('pastorders.restaurantId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sort past orders by date in descending order (newest first)
    const sortedOrders = user.pastorders.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({ pastorders: sortedOrders });
  } catch (err) {
    console.error('Error fetching past orders:', err);
    res.status(500).json({ error: err.message });
  }
});


// Add a new order to user's past orders
router.post('/pastorders', authMiddleware, async (req, res) => {
  const { dishId, restaurantId, quantity, totalPrice } = req.body;

  try {
    if (!dishId || !restaurantId || !quantity || !totalPrice) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newOrder = {
      dishId,
      restaurantId,
      quantity,
      totalPrice,
      date: new Date(),  
    };

    // Push new order to the pastorders array
    user.pastorders.push(newOrder);

    // Sort orders by date in descending order (newest first)
    user.pastorders.sort((a, b) => new Date(b.date) - new Date(a.date));

    await user.save();

    res.status(201).json({ message: 'Order added to past orders', newOrder });
  } catch (err) {
    console.error('Error adding past order:', err);
    res.status(500).json({ error: err.message });
  }
});


// Get recommended dishes for a user
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Placeholder for future recommendation logic
    const recommendedDishes = await getRecommendedDishes(user);

    res.status(200).json({ recommendations: recommendedDishes });
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    res.status(500).json({ error: err.message });
  }
});


// Like a dish
router.post('/likeddishes', authMiddleware, async (req, res) => {
  const { dishId } = req.body;

  if (!dishId) {
    return res.status(400).json({ message: 'dishId is required' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { liked_dishes: dishId },
        $pull: { disliked_dishes: dishId }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Dish added to liked dishes', liked_dishes: user.liked_dishes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dislike a dish
router.post('/dislikeddishes', authMiddleware, async (req, res) => {
  const { dishId } = req.body;

  if (!dishId) {
    return res.status(400).json({ message: 'dishId is required' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { disliked_dishes: dishId },
        $pull: { liked_dishes: dishId }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Dish added to disliked dishes', disliked_dishes: user.disliked_dishes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
