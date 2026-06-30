'use strict';

const express = require('express');
const ctrl = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { idParam } = require('../validators/commonValidators');
const { addToCartSchema, updateQuantitySchema } = require('../validators/cartValidators');

const router = express.Router();

router.use(authenticateToken);

router.get('/', ctrl.getCart);
router.post('/', validate({ body: addToCartSchema }), ctrl.addToCart);
router.patch('/:id', validate({ params: idParam, body: updateQuantitySchema }), ctrl.updateQuantity);
router.delete('/:id', validate({ params: idParam }), ctrl.removeItem);
router.post('/:id/save', validate({ params: idParam }), ctrl.saveForLater);
router.post('/:id/move', validate({ params: idParam }), ctrl.moveToCart);

module.exports = router;
