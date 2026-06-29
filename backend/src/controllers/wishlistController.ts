import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { NotFoundError } from '../lib/errors';
import analyticsService from '../services/analyticsService';

export const getWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const wishlist = await prisma.wishlist.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });
        res.json(wishlist || { items: [] });
    } catch (error) {
        next(error);
    }
};

export const addToWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { productId } = req.body;

        // Check if product exists
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // Get or create wishlist
        let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
        if (!wishlist) {
            wishlist = await prisma.wishlist.create({
                data: { userId },
            });
        }

        // Check if already in wishlist
        const existingItem = await prisma.wishlistItem.findUnique({
            where: {
                wishlistId_productId: {
                    wishlistId: wishlist.id,
                    productId,
                },
            },
        });

        if (!existingItem) {
            await prisma.wishlistItem.create({
                data: {
                    wishlistId: wishlist.id,
                    productId,
                },
            });

            // Track event for analytics
            try {
                await analyticsService.trackEvent(productId, userId, 'wishlist_add');
            } catch (err) {
                console.error('Failed to track wishlist_add event:', err);
            }
        }

        const updatedWishlist = await prisma.wishlist.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });

        res.status(201).json(updatedWishlist);
    } catch (error) {
        next(error);
    }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { productId } = req.params;

        const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
        if (!wishlist) {
            throw new NotFoundError('Wishlist not found');
        }

        // Delete the item if it exists
        await prisma.wishlistItem.deleteMany({
            where: {
                wishlistId: wishlist.id,
                productId,
            },
        });

        const updatedWishlist = await prisma.wishlist.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });

        res.json(updatedWishlist);
    } catch (error) {
        next(error);
    }
};

export default { getWishlist, addToWishlist, removeFromWishlist };
