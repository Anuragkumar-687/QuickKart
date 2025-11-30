import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function DELETE() {
    try {
        await dbConnect();
        await Product.deleteMany({});

        return NextResponse.json({ message: 'All products deleted successfully' });
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal Server Error', error },
            { status: 500 }
        );
    }
}
