'use strict';

const express = require('express');
const ctrl = require('../controllers/analyticsController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { heavyLimiter } = require('../middleware/rateLimit');
const { validate } = require('../middleware/validate');
const { trackSchema } = require('../validators/analyticsValidators');
const { dashboardQuerySchema } = require('../validators/recommendationValidators');

const router = express.Router();

// Public tracking (works anonymously, attaches user when logged in)
router.post('/track', optionalAuth, validate({ body: trackSchema }), ctrl.track);

// Admin-only
router.post('/recompute', authenticateToken, requireAdmin, heavyLimiter, ctrl.recompute);
router.get(
  '/regions',
  authenticateToken,
  requireAdmin,
  validate({ query: dashboardQuerySchema }),
  ctrl.regions
);

module.exports = router;
