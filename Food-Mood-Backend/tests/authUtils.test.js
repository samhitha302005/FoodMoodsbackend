// tests/authUtils.test.js
const { hashPassword, comparePasswords } = require('../utils/authUtils');
const bcrypt = require('bcryptjs');

jest.mock('bcryptjs');  // Mocking bcryptjs methods

describe('hashPassword', () => {
  it('should hash the password correctly', async () => {
    const password = 'password123';
    const hashedPassword = 'hashedPassword123';

    // Mocking bcrypt.hash to return a fake hash
    bcrypt.hash.mockResolvedValue(hashedPassword);

    const result = await hashPassword(password);
    expect(result).toBe(hashedPassword);
  });
});

describe('comparePasswords', () => {
  it('should return true if the password matches the hash', async () => {
    const password = 'password123';
    const hash = 'hashedPassword123';

    // Mocking bcrypt.compare to return true for matching passwords
    bcrypt.compare.mockResolvedValue(true);

    const result = await comparePasswords(password, hash);
    expect(result).toBe(true);  // Passwords match
  });

  it('should return false if the password does not match the hash', async () => {
    const password = 'password123';
    const hash = 'hashedPassword123';

    // Mocking bcrypt.compare to return false for non-matching passwords
    bcrypt.compare.mockResolvedValue(false);

    const result = await comparePasswords(password, hash);
    expect(result).toBe(false);  // Passwords do not match
  });
});
