import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Cart from '@/models/Cart';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;
        await dbConnect();

        const cart = await Cart.findOne({ user: session.user.id });

        if (!cart) {
            return NextResponse.json(
                { message: 'Cart not found' },
                { status: 404 }
            );
        }

        // Remove the item from cart
        cart.items = cart.items.filter((item: { _id: { toString: () => string } }) => item._id.toString() !== id);
        await cart.save();

        const populatedCart = await Cart.findById(cart._id).populate('items.product');

        return NextResponse.json(populatedCart);
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal Server Error', error },
            { status: 500 }
        );
    }
}
