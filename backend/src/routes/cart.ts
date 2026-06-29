import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart
} from '../controllers/cartController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { addToCartSchema, updateCartItemSchema } from '../lib/validation';

const router = express.Router();

router.get('/', authenticateToken, getCart);
router.post(
    '/',
    authenticateToken,
    validate(addToCartSchema),
    addToCart
);
router.patch(
    '/:id',
    authenticateToken,
    validate(updateCartItemSchema),
    updateCartItemQuantity
);
router.delete('/:id', authenticateToken, removeFromCart);

export default router;
