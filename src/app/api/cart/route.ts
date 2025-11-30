import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
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
        const cart = await Cart.findOne({ user: session.user.id }).populate('items.product');

        if (!cart) {
            return NextResponse.json({ items: [] });
        }

        return NextResponse.json(cart);
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal Server Error', error },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { productId, quantity } = await req.json();

        if (!productId || !quantity) {
            return NextResponse.json(
                { message: 'Please provide product ID and quantity' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if product exists and has stock
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }
        if (product.stock < quantity) {
            return NextResponse.json({ message: 'Insufficient stock' }, { status: 400 });
        }

        let cart = await Cart.findOne({ user: session.user.id });

        if (!cart) {
            cart = await Cart.create({
                user: session.user.id,
                items: [{ product: productId, quantity }],
            });
        } else {
            const itemIndex = cart.items.findIndex(
                (item: { product: { toString: () => string } }) => item.product.toString() === productId
            );

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }

            await cart.save();
        }

        const populatedCart = await Cart.findById(cart._id).populate('items.product');

        return NextResponse.json(populatedCart);
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal Server Error', error },
            { status: 500 }
        );
    }
}
