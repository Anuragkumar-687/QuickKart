'use strict';

const express = require('express');
const ctrl = require('../controllers/inventoryController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

const router = express.Router();

// Admin-only inventory intelligence (Phase 3)
router.get('/alerts', authenticateToken, requireAdmin, ctrl.alerts);
router.get('/forecast', authenticateToken, requireAdmin, ctrl.forecast);

module.exports = router;
