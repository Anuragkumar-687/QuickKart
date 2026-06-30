'use strict';

const express = require('express');
const ctrl = require('../controllers/ingestionController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { heavyLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Admin-only. POST /api/ingestion/sync refreshes the catalog from external APIs.
router.post('/sync', authenticateToken, requireAdmin, heavyLimiter, ctrl.sync);
router.get('/status', authenticateToken, requireAdmin, ctrl.status);

module.exports = router;
