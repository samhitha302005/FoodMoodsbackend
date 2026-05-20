const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

const User = require('../models/User');
const Dish = require('../models/Dish');
const Restaurant = require('../models/Restaurant');
const DishAvailability = require('../models/DishAvailability');
const Cart = require('../models/Cart');
const bcrypt = require('bcryptjs');

let mongoServer;
let token;
let dishId;
let restaurantId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Register user
  const password_hash = await bcrypt.hash('testpass123', 10);
  const user = await User.create({
    name: 'Cart Tester',
    email: 'cart@example.com',
    password_hash,
  });

  // Login to get token
  const res = await request(app).post('/api/users/login').send({
    email: 'cart@example.com',
    password: 'testpass123',
  });
  token = res.body.token;

  // Create dish
  const dishRes = await request(app).post('/api/dishes').send({
    name: 'Paneer Butter Masala',
    description: 'Creamy curry',
    vegetarian: true,
    rating: 4,
  });
  dishId = dishRes.body.id;

  // Create restaurant
  const restRes = await request(app).post('/api/restaurants').send({
    name: 'SpiceHub',
    cuisine_type: 'Indian',
  });
  restaurantId = restRes.body.id;

  // Create dish availability
  await request(app).post('/api/dish-availability').send({
    dish_id: dishId,
    restaurant_id: restaurantId,
    price: 180,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Cart.deleteMany({});
});



describe('Cart Routes - Add to Cart', () => {
  it('should add a valid item to the cart', async () => {
    const dishAvailability = await DishAvailability.findOne({ dish_id: dishId, restaurant_id: restaurantId });

    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        dish_id: dishId,
        restaurant_id: restaurantId,
        quantity: 2,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('items');
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].dish_availability_id).toBe(dishAvailability._id.toString());
    expect(res.body.items[0].quantity).toBe(2);
  });

  it('should return 400 for invalid dish and restaurant combination', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        dish_id: new mongoose.Types.ObjectId(),
        restaurant_id: new mongoose.Types.ObjectId(),
        quantity: 1,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Invalid dish and restaurant combination');
  });

  it('should get the user cart', async () => {
    // First add an item
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        dish_id: dishId,
        restaurant_id: restaurantId,
        quantity: 2,
      });

    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0]).toHaveProperty('quantity', 2);
  });

  it('should delete a cart item by dishId and restaurantId', async () => {
    // Add an item first
    const addRes = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        dish_id: dishId,
        restaurant_id: restaurantId,
        quantity: 2,
      });
  
    expect(addRes.statusCode).toBe(201);
  
    // Perform delete
    const delRes = await request(app)
      .delete(`/api/cart/${dishId}/${restaurantId}`)
      .set('Authorization', `Bearer ${token}`);
  
    expect(delRes.statusCode).toBe(200);
    expect(delRes.body).toHaveProperty('items');
    expect(delRes.body.items.length).toBe(0); // Should be empty after deletion
  
    // Confirm it's deleted
    const getRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);
  
    expect(getRes.body.items.length).toBe(0);
  });
  
});
