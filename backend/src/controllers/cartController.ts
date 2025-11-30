import { Request, Response } from 'express';
import { prisma } from '../server';

interface AuthRequest extends Request {
    user?: any;
}

export const getCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });
        res.json(cart || { items: [] });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error });
    }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        let cart = await prisma.cart.findUnique({ where: { userId } });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
            });
        }

        const existingItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId },
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
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

        const updatedCart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });

        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: 'Error adding to cart', error });
    }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { id } = req.params; // CartItem ID

        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });


        await prisma.cartItem.delete({ where: { id } });

        const updatedCart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });

        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: 'Error removing from cart', error });
    }
};
