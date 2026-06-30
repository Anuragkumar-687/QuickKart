'use strict';

const express = require('express');
const ctrl = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const { validate } = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} = require('../validators/authValidators');

const router = express.Router();

router.post('/signup', authLimiter, validate({ body: registerSchema }), ctrl.register);
router.post('/register', authLimiter, validate({ body: registerSchema }), ctrl.register); // alias
router.post('/login', authLimiter, validate({ body: loginSchema }), ctrl.login);

router.get('/me', authenticateToken, ctrl.me);
router.patch('/me', authenticateToken, validate({ body: updateProfileSchema }), ctrl.updateMe);

module.exports = router;
