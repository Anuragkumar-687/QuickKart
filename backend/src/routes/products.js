'use strict';

const express = require('express');
const ctrl = require('../controllers/productController');
const reviewCtrl = require('../controllers/reviewController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { idParam } = require('../validators/commonValidators');
const {
  listQuerySchema,
  createProductSchema,
  updateProductSchema,
} = require('../validators/productValidators');
const { createReviewSchema } = require('../validators/reviewValidators');

const router = express.Router();

// Public
router.get('/', validate({ query: listQuerySchema }), ctrl.getProducts);
router.get('/categories', ctrl.getCategories);
router.get('/:id', validate({ params: idParam }), optionalAuth, ctrl.getProductById);

// Nested reviews
router.get('/:id/reviews', validate({ params: idParam }), reviewCtrl.listForProduct);
router.post(
  '/:id/reviews',
  authenticateToken,
  validate({ params: idParam, body: createReviewSchema }),
  reviewCtrl.upsertForProduct
);

// Admin-only catalog management
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  validate({ body: createProductSchema }),
  ctrl.createProduct
);
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  validate({ params: idParam, body: updateProductSchema }),
  ctrl.updateProduct
);
router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  validate({ params: idParam }),
  ctrl.deleteProduct
);

module.exports = router;
