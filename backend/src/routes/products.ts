import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController';
import { authenticateToken, authenticateTokenOptional } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { productCreateSchema, productUpdateSchema } from '../lib/validation';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', authenticateTokenOptional, getProductById);
router.post(
    '/',
    authenticateToken,
    requireRole('admin'),
    validate(productCreateSchema),
    createProduct
);
router.put(
    '/:id',
    authenticateToken,
    requireRole('admin'),
    validate(productUpdateSchema),
    updateProduct
);
router.delete(
    '/:id',
    authenticateToken,
    requireRole('admin'),
    deleteProduct
);

export default router;
