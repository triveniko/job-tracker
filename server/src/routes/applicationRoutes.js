const express = require('express');
const { body } = require('express-validator');
const c = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { STATUSES } = require('../models/Application');

const router = express.Router();
router.use(protect);   // every route below requires a valid token

const createRules = [
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('status').optional().isIn(STATUSES).withMessage('Invalid status'),
];
const updateRules = [
  body('company').optional().trim().notEmpty().withMessage('Company cannot be empty'),
  body('role').optional().trim().notEmpty().withMessage('Role cannot be empty'),
  body('status').optional().isIn(STATUSES).withMessage('Invalid status'),
];

router.get('/stats', c.getStats);            // must be before '/:id'
router.route('/').get(c.getApplications).post(createRules, validate, c.createApplication);
router.route('/:id').put(updateRules, validate, c.updateApplication).delete(c.deleteApplication);

module.exports = router;