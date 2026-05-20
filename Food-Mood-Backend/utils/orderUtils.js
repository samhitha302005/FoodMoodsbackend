// utils/orderUtils.js
const DishAvailability = require('../models/DishAvailability');
const Dish = require('../models/Dish');


const generatePastOrders = async () => {
  const orders = [];
  try {
    const dishAvailabilities = await DishAvailability.find();

    if (!dishAvailabilities.length) {
      // console.log('No dish availabilities found.');
      return orders;
    }

    const today = new Date();
    const dateDistributions = [3, 3, 4, 2, 5, 3]; 

    let orderIndex = 0;

    for (let i = 1; i <= dateDistributions.length; i++) {
      const numOrdersToday = dateDistributions[i-1];

      const orderDate = new Date(today);
      orderDate.setDate(today.getDate() - i);

      for (let j = 0; j < numOrdersToday; j++) {
        const randomDishAvailability = dishAvailabilities[Math.floor(Math.random() * dishAvailabilities.length)];
        const quantity = Math.floor(Math.random() * 5) + 1;

        const order = {
          dishId: randomDishAvailability.dish_id,
          restaurantId: randomDishAvailability.restaurant_id,
          quantity: quantity,
          totalPrice: randomDishAvailability.price * quantity,
          date: new Date(orderDate),
        };

        orders.push(order);
        orderIndex++;

        if (orderIndex >= 20) break;
      }

      if (orderIndex >= 20) break;
    }
  } catch (err) {
    console.error('Error generating past orders:', err);
  }

  return orders;
};

// const getRecommendedDishes = async (user) => {
//   return user;
// };

const { spawn } = require('child_process');

const callMLModel = (payload) => {
  return new Promise((resolve, reject) => {
    const py = spawn('python', ['./scripts/model.py']);
    let result = '';

    py.stdout.on('data', (data) => { result += data.toString(); });
    py.stderr.on('data', (err) => console.error(err.toString()));
    // py.on('close', () => resolve(JSON.parse(result)));
    py.on('close', () => {
      try {
        resolve(JSON.parse(result));
      } catch (err) {
        console.error("Failed to parse Python output:", result);
        reject(err);
      }
    });
    

    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();
  });
};


const getRecommendedDishes = async (user) => {
  const likedIds = user.liked_dishes || [];
  const dislikedIds = user.disliked_dishes || [];
  const pastOrderIds = user.pastorders.map(order => order.dishId?.toString()).filter(Boolean);

  // Collect all unique dish IDs to fetch from DB
  const allRelevantDishIds = [...new Set([...likedIds, ...dislikedIds, ...pastOrderIds])];

  const dishes = await Dish.find({ _id: { $in: allRelevantDishIds } });

  const idToName = {};
  const nameToGenome = {};

  dishes.forEach(dish => {
    const id = dish._id.toString();
    idToName[id] = dish.name;
    nameToGenome[dish.name] = Object.fromEntries(dish.genome_data);
  });

  // Map ID arrays to names, preserving duplicates
  const likedDishNames = likedIds.map(id => idToName[id]).filter(Boolean);
  const dislikedDishNames = dislikedIds.map(id => idToName[id]).filter(Boolean);
  const pastOrderDishNames = pastOrderIds.map(id => idToName[id]).filter(Boolean);

  const modelInput = {
    liked_dishes: likedDishNames,
    disliked_dishes: dislikedDishNames,
    past_orders: pastOrderDishNames,
    all_dishes: nameToGenome
  };

  // TODO: Replace with real model call
  const recommendedDishNames = await callMLModel(modelInput); // returns top dish names

  // Get full dish objects for the recommended names
  const recommendedDishes = await Dish.find({ name: { $in: recommendedDishNames } });

  return recommendedDishes;
};


module.exports = { generatePastOrders, getRecommendedDishes };
