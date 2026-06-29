import express from 'express';
import { triggerIngest } from '../controllers/ingestionController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = express.Router();

router.post(
    '/',
    authenticateToken,
    requireRole('admin'),
    triggerIngest
);

export default router;
