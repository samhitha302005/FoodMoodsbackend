require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
import { ensureGenomeData } from './genomeHelper';

// Load your models
const DishAvailability = require('../models/DishAvailability');
const Dish = require('../models/Dish');
const Restaurant = require('../models/Restaurant');
const { ensureGenomeData } = require('./genomeHelper');

// Connect to MongoDB 
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Load JSON files
const dishes = JSON.parse(fs.readFileSync('../data/dishes.json', 'utf8'));
const restaurants = JSON.parse(fs.readFileSync('../data/restaurants.json', 'utf8'));

ensureGenomeData(dishes);

// Helper: shuffle array
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function createStrictDishAvailability() {
  try {
    // Insert dishes and restaurants into DB and get their _id
    const dishDocs = await Dish.insertMany(dishes);
    const restaurantDocs = await Restaurant.insertMany(restaurants);

    const restaurantPool = restaurantDocs.map(r => r._id.toString());

    const dishAvailabilityRecords = [];

    // Track how many dishes each restaurant has
    const restaurantDishCount = new Map();
    for (let r of restaurantPool) {
      restaurantDishCount.set(r, 0);
    }

    for (let dish of dishDocs) {
      // Shuffle restaurants to randomly pick
      let shuffledRestaurants = shuffleArray(restaurantPool);

      let selectedRestaurants = [];

      for (let restId of shuffledRestaurants) {
        if (restaurantDishCount.get(restId) < 15) { // Only pick if restaurant has less than 15
          selectedRestaurants.push(restId);
          restaurantDishCount.set(restId, restaurantDishCount.get(restId) + 1);
        }
        if (selectedRestaurants.length === 3) break;
      }

      if (selectedRestaurants.length < 3) {
        console.error(`Not enough restaurants left for dish ${dish.name}`);
        continue; // In rare case something goes wrong
      }

      for (let restaurantId of selectedRestaurants) {
        const randomPrice = (Math.random() * (30 - 5) + 5).toFixed(2);

        dishAvailabilityRecords.push({
          dish_id: dish._id,
          restaurant_id: restaurantId,
          price: randomPrice
        });
      }
    }

    console.log('✅ Created dish availability mappings, inserting into DB...');

    await DishAvailability.insertMany(dishAvailabilityRecords);

    console.log('✅ DishAvailability records created successfully.');
    
    console.log('📊 Final Dish Count per Restaurant:');
    for (let [restId, count] of restaurantDishCount.entries()) {
      console.log(`Restaurant ${restId}: ${count} dishes`);
    }

  } catch (err) {
    console.error('Error creating DishAvailability:', err);
  } finally {
    mongoose.disconnect();
  }
}

createStrictDishAvailability();
