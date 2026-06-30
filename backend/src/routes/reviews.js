'use strict';

const express = require('express');
const ctrl = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { idParam } = require('../validators/commonValidators');

const router = express.Router();

// Listing/creating reviews is done via /api/products/:id/reviews (see products route).
// This router handles direct review operations.
router.delete('/:id', authenticateToken, validate({ params: idParam }), ctrl.remove);

module.exports = router;
