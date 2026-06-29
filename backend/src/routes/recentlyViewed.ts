import express from 'express';
import { getRecentlyViewed } from '../controllers/recentlyViewedController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get(
    '/',
    authenticateToken,
    getRecentlyViewed
);

export default router;
