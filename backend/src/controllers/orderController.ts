import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { ValidationError, NotFoundError } from '../lib/errors';
import analyticsService from '../services/analyticsService';

export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const orders = await prisma.order.findMany({
            where: { userId },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });

        if (!cart || cart.items.length === 0) {
            throw new ValidationError('Cart is empty');
        }

        // Perform stock checks and updates within a transaction
        const order = await prisma.$transaction(async (tx) => {
            // Re-verify stock for all items
            for (const item of cart.items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId }
                });

                if (!product) {
                    throw new NotFoundError(`Product not found: ${item.productId}`);
                }

                if (product.stock < item.quantity) {
                    throw new ValidationError(`Insufficient stock for "${product.name}". Only ${product.stock} items left.`);
                }

                // Decrement stock and increment purchaseCount
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { decrement: item.quantity },
                        purchaseCount: { increment: item.quantity }
                    }
                });
            }

            const totalAmount = cart.items.reduce(
                (acc, item) => acc + item.product.price * item.quantity,
                0
            );

            // Create the order
            const createdOrder = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price,
                        })),
                    },
                },
                include: { items: { include: { product: true } } },
            });

            // Clear cart items
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

            return createdOrder;
        });

        // Fire analytics purchase events outside of the database transaction
        for (const item of cart.items) {
            try {
                await analyticsService.trackEvent(item.productId, userId, 'purchase', {
                    quantity: item.quantity,
                    price: item.product.price,
                    orderId: order.id
                });
            } catch (err) {
                console.error('Failed to log purchase event:', err);
            }
        }

        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};
