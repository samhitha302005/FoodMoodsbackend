// utils/authUtils.js
const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  const password_hash = await bcrypt.hash(password, 10);
  return password_hash;
};

const comparePasswords = async (password, hash) => {
  const isMatch = await bcrypt.compare(password, hash);
  return isMatch;
};

module.exports = { hashPassword, comparePasswords };
