const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const userWithoutPassword = (user) => {
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('A user with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email: normalizedEmail, password });
  res.status(201).json({ token: createToken(user._id), user: userWithoutPassword(user) });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  res.json({ token: createToken(user._id), user: userWithoutPassword(user) });
};

const getMe = async (req, res) => {
  res.json({ user: userWithoutPassword(req.user) });
};

module.exports = { register, login, getMe };
