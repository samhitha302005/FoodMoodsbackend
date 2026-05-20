const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // Replace with your Express app if exported separately
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('User Routes', () => {
  const testUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123',
  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.email).toBe(testUser.email);
  });

  it('should not register with an existing email', async () => {
    await request(app).post('/api/users/register').send(testUser);

    const res = await request(app)
      .post('/api/users/register')
      .send(testUser);
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('error', 'Email already exists');
  });

  it('should login with valid credentials', async () => {
    await request(app).post('/api/users/register').send(testUser);

    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with invalid password', async () => {
    await request(app).post('/api/users/register').send(testUser);

    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: testUser.email,
        password: 'wrongPassword',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });
});
