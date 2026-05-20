const express = require('express');
const Dish = require('../models/Dish');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.status(200).json(dishes);
     } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.status(200).json(dish)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST a new dish
router.post('/', async (req, res) => {
  try {
    const newDish = new Dish(req.body);
    const savedDish = await newDish.save();
    res.status(201).json({ id: savedDish._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// DELETE a dish by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedDish = await Dish.findByIdAndDelete(req.params.id);
    if (!deletedDish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.status(200).json({ message: 'Dish deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
