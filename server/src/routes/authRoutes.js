const express = require('express');
const { body } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { register, login, getMe } = require('../controllers/authController');

const router = express.Router();

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('password')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

router.post('/register', registerRules, validate, asyncHandler(register));
router.post('/login', loginRules, validate, asyncHandler(login));
router.get('/me', protect, asyncHandler(getMe));

module.exports = router;
