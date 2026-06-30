'use strict';

const express = require('express');
const ctrl = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', ctrl.getOrders);
router.post('/', ctrl.createOrder);

module.exports = router;
