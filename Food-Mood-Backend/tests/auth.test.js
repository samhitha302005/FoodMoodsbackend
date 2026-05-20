const authMiddleware = require('../auth');  // Path to your middleware file
const jwt = require('jsonwebtoken');       // JWT library we need to mock
const httpMocks = require('node-mocks-http');  // To mock Express req/res

jest.mock('jsonwebtoken');  // Mock the jwt library

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();  // Create a new mock request object
    res = httpMocks.createResponse();  // Create a mock response object
    next = jest.fn();  // Create a mock function to simulate `next()`
  });

  it('should call next if token is valid', () => {
    // Mock jwt.verify to simulate a valid token
    jwt.verify.mockImplementationOnce((token, secret) => {
      return { _id: 'testuser123' };  // Return a valid user object
    });

    req.headers['authorization'] = 'Bearer validToken';

    // Call the authMiddleware
    authMiddleware(req, res, next);

    // Check if next() was called after successful token verification
    expect(next).toHaveBeenCalled();  // Expect next() to be called
    expect(req.user).toEqual({ _id: 'testuser123' });  // Check if req.user was set correctly
  });

  it('should respond with 401 if no token is provided', () => {
    authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);  // Unauthorized if no token
    expect(res._getData()).toEqual(JSON.stringify({ message: 'Access Denied' }));
  });

  it('should respond with 400 if token is invalid', () => {
    // Mocking an invalid token scenario
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('Invalid token');  // Simulating invalid token error
    });

    req.headers['authorization'] = 'Bearer invalidToken';

    // Call the middleware with an invalid token
    authMiddleware(req, res, next);

    expect(res.statusCode).toBe(400);  // Bad request if token is invalid
    expect(res._getData()).toEqual(JSON.stringify({ message: 'Invalid Token' }));
  });
});
