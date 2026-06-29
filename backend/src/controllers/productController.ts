import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import productService from '../services/productService';
import { NotFoundError } from '../lib/errors';
import prisma from '../lib/prisma';

export const getProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        console.log('Fetching products with query:', req.query);
        const filters = {
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,
            search: req.query.search as string,
            category: req.query.category as string,
            sort: req.query.sort as string,
        };

        const result = await productService.getProducts(filters);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || null;
        const region = (req.headers['x-region'] || req.query.region || 'US') as string;

        const product = await productService.getProductById(id);
        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // Increment view count, fire product event, track region popularity
        await productService.incrementViewCount(id, userId, region);

        // Record to recently viewed for authenticated users
        if (userId) {
            try {
                await prisma.recentlyViewed.upsert({
                    where: {
                        userId_productId: {
                            userId,
                            productId: id,
                        }
                    },
                    update: {
                        viewedAt: new Date()
                    },
                    create: {
                        userId,
                        productId: id,
                    }
                });
            } catch (err) {
                console.error('Failed to upsert recently viewed:', err);
            }
        }

        // Return latest product state
        const updatedProduct = await productService.getProductById(id);
        res.json(updatedProduct);
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const product = await productService.updateProduct(id, req.body);
        res.json(product);
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await productService.deleteProduct(id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};
