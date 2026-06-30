'use strict';

const express = require('express');
const ctrl = require('../controllers/recommendationController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { idParam, productIdParam } = require('../validators/commonValidators');
const { recQuerySchema } = require('../validators/recommendationValidators');

const router = express.Router();

router.get('/trending', optionalAuth, validate({ query: recQuerySchema }), ctrl.trending);
router.get('/region', optionalAuth, validate({ query: recQuerySchema }), ctrl.region);
router.get('/personalized', authenticateToken, validate({ query: recQuerySchema }), ctrl.personalized);
router.get('/recently-viewed', authenticateToken, validate({ query: recQuerySchema }), ctrl.recentlyViewed);
router.get(
  '/bundles/:productId',
  validate({ params: productIdParam, query: recQuerySchema }),
  ctrl.bundles
);

module.exports = router;
