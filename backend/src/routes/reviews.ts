import { Router } from 'express';

const router = Router();

// Placeholder route
router.get('/', (req, res) => {
    res.json({ message: 'Reviews route active' });
});

export default router;
