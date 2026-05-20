const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // adjust path if needed

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('System Test - Full Flow', () => {
  it('registers, logs in, creates data, adds to cart, and fetches it', async () => {
    // 1. Register
    await request(app).post('/api/users/register').send({
      name: 'System User',
      email: 'system@test.com',
      password: 'system123',
    });

    // 2. Login
    const loginRes = await request(app).post('/api/users/login').send({
      email: 'system@test.com',
      password: 'system123',
    });
    const token = loginRes.body.token;

    // 3. Create Dish
    const dishRes = await request(app).post('/api/dishes').send({
      name: 'Chole Bhature',
      description: 'Spicy chickpeas and fried bread',
      vegetarian: true,
      rating: 4.5,
    });
    const dishId = dishRes.body.id;

    // 4. Create Restaurant
    const restRes = await request(app).post('/api/restaurants').send({
      name: 'Delhi Tadka',
      cuisine_type: 'North Indian',
    });
    const restaurantId = restRes.body.id;

    // 5. Create Availability
    await request(app).post('/api/dish-availability').send({
      dish_id: dishId,
      restaurant_id: restaurantId,
      price: 150,
    });

    // 6. Add to Cart
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        dish_id: dishId,
        restaurant_id: restaurantId,
        quantity: 2,
      });

    // 7. Fetch Cart
    const cartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(cartRes.statusCode).toBe(200);
    expect(cartRes.body.items.length).toBe(1);
    expect(cartRes.body.items[0].quantity).toBe(2);
  });
});
