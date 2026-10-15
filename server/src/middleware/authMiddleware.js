const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

const unauthorized = (message) => {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
};

const protect = asyncHandler(async (req, res, next) => {
  const match = (req.headers.authorization || '').match(/^Bearer\s+(.+)$/i);

  if (!match) {
    throw unauthorized('Not authorized, no token');
  }

  let decoded;
  try {
    decoded = jwt.verify(match[1], process.env.JWT_SECRET);
  } catch (error) {
    throw unauthorized('Not authorized, token failed');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw unauthorized('Not authorized, user not found');
  }

  req.user = user;
  next();
});

module.exports = { protect };
