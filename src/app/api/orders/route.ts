import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(_req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();
        const orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 });

        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal Server Error', error },
            { status: 500 }
        );
    }
}

export async function POST(_req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Get user's cart
        const cart = await Cart.findOne({ user: session.user.id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return NextResponse.json(
                { message: 'Cart is empty' },
                { status: 400 }
            );
        }

        // Calculate total
        const totalAmount = cart.items.reduce(
            (acc: number, item: { product: { price: number }; quantity: number }) => acc + item.product.price * item.quantity,
            0
        );

        // Create order
        const order = await Order.create({
            user: session.user.id,
            items: cart.items.map((item: { product: { _id: string; price: number }; quantity: number }) => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price,
            })),
            totalAmount,
            status: 'pending',
        });

        // Clear cart
        await Cart.findByIdAndDelete(cart._id);

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal Server Error', error },
            { status: 500 }
        );
    }
}
