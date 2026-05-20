const express = require('express');
const DishAvailability = require('../models/DishAvailability');
const router = express.Router();

// Get all dish availability records
router.get('/', async (req, res) => {
  try {
    const dishAvailability = await DishAvailability.find();

    if (!dishAvailability.length) {
      return res.status(404).json({ message: 'No dish availability records found' });
    }

    res.status(200).json(dishAvailability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get restaurants where a specific dish is available
router.get('/dish/:dishId', async (req, res) => {
  try {
    const { dishId } = req.params;

    // Find all DishAvailability entries for this dishId
    const dishAvailability = await DishAvailability.find({ dish_id: dishId });

    if (!dishAvailability.length) {
      return res.status(404).json({ message: 'No restaurants found for this dish' });
    }

    // Format the response to include restaurant_id and price
    const result = dishAvailability.map(item => ({
      restaurantId: item.restaurant_id,
      price: item.price
    }));

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all dishes available at a specific restaurant with their prices
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Find all DishAvailability entries for this restaurantId
    const dishAvailability = await DishAvailability.find({ restaurant_id: restaurantId });

    if (!dishAvailability.length) {
      return res.status(404).json({ message: 'No dishes found for this restaurant' });
    }

    // Format the response to include dish_id and price
    const result = dishAvailability.map(item => ({
      dishId: item.dish_id,
      price: item.price
    }));

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST a new dish availability record (returns ID)
router.post('/', async (req, res) => {
  try {
    const newAvailability = new DishAvailability(req.body);
    const savedRecord = await newAvailability.save();
    res.status(201).json({ id: savedRecord._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a dish availability record by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedRecord = await DishAvailability.findByIdAndDelete(req.params.id);
    if (!deletedRecord) {
      return res.status(404).json({ message: 'Dish availability record not found' });
    }
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
