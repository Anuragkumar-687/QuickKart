import express from 'express';
import { getCart, addToCart, removeFromCart } from '../controllers/cartController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getCart);
router.post('/', authenticateToken, addToCart);
router.delete('/:id', authenticateToken, removeFromCart);

export default router;
