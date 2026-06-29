import express from 'express';
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} from '../controllers/wishlistController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { addToWishlistSchema } from '../lib/validation';

const router = express.Router();

router.get('/', authenticateToken, getWishlist);
router.post(
    '/',
    authenticateToken,
    validate(addToWishlistSchema),
    addToWishlist
);
router.delete('/:productId', authenticateToken, removeFromWishlist);

export default router;
