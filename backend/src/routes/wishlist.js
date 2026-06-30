'use strict';

const express = require('express');
const ctrl = require('../controllers/wishlistController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { productIdParam } = require('../validators/commonValidators');

const router = express.Router();

router.use(authenticateToken);

router.get('/', ctrl.getWishlist);
router.post('/:productId', validate({ params: productIdParam }), ctrl.toggle); // toggle add/remove
router.delete('/:productId', validate({ params: productIdParam }), ctrl.remove);

module.exports = router;
