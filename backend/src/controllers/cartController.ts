import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { NotFoundError, ValidationError, ForbiddenError } from '../lib/errors';
import analyticsService from '../services/analyticsService';

export const getCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });
        res.json(cart || { items: [] });
    } catch (error) {
        next(error);
    }
};

export const addToCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { productId, quantity } = req.body;

        // Validate product and stock
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            throw new NotFoundError('Product not found');
        }

        let cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
            });
        }

        const existingItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId },
        });

        const newQty = (existingItem?.quantity || 0) + quantity;

        if (newQty > product.stock) {
            throw new ValidationError(`Insufficient stock. Only ${product.stock} items left.`);
        }

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQty },
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                },
            });
        }

        // Fire analytics event
        await analyticsService.trackEvent(productId, userId, 'cart_add', { quantity });

        const updatedCart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });

        res.json(updatedCart);
    } catch (error) {
        next(error);
    }
};

export const updateCartItemQuantity = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params; // CartItem ID
        const { quantity } = req.body;

        const cartItem = await prisma.cartItem.findUnique({
            where: { id },
            include: {
                cart: true,
                product: true,
            }
        });

        if (!cartItem || cartItem.cart.userId !== userId) {
            throw new NotFoundError('Cart item not found');
        }

        if (quantity > cartItem.product.stock) {
            throw new ValidationError(`Insufficient stock. Only ${cartItem.product.stock} items left.`);
        }

        await prisma.cartItem.update({
            where: { id },
            data: { quantity }
        });

        const updatedCart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });

        res.json(updatedCart);
    } catch (error) {
        next(error);
    }
};

export const removeFromCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params; // CartItem ID

        const cartItem = await prisma.cartItem.findUnique({
            where: { id },
            include: { cart: true }
        });

        if (!cartItem || cartItem.cart.userId !== userId) {
            throw new NotFoundError('Cart item not found');
        }

        await prisma.cartItem.delete({ where: { id } });

        const updatedCart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });

        res.json(updatedCart);
    } catch (error) {
        next(error);
    }
};
