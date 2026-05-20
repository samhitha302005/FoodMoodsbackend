// tests/orderUtils.test.js
const { generatePastOrders } = require('../utils/orderUtils');
const DishAvailability = require('../models/DishAvailability');
const Dish = require('../models/Dish');

jest.mock('../models/DishAvailability');  // Mocking the DishAvailability model

describe('generatePastOrders', () => {
  it('should generate 20 orders based on dish availability and distribution', async () => {
    // Mocking the find method to return fake dish data
    DishAvailability.find.mockResolvedValue([
      { dish_id: '1', restaurant_id: '101', price: 10 },
      { dish_id: '2', restaurant_id: '102', price: 15 },
      { dish_id: '3', restaurant_id: '103', price: 20 },
    ]);

    const orders = await generatePastOrders();

    // Checking that 10 orders are generated
    expect(orders.length).toBe(20);

    // Checking that all orders have the expected structure
    expect(orders[0]).toHaveProperty('dishId');
    expect(orders[0]).toHaveProperty('restaurantId');
    expect(orders[0]).toHaveProperty('quantity');
    expect(orders[0]).toHaveProperty('totalPrice');
    expect(orders[0]).toHaveProperty('date');
  });

  it('should return an empty array if no dish availability is found', async () => {
    // Mocking the find method to return an empty array
    DishAvailability.find.mockResolvedValue([]);

    const orders = await generatePastOrders();

    expect(orders).toEqual([]); // Should return an empty array
  });
});