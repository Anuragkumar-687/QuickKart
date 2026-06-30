'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/ProductCard';

export default function WishlistPage() {
    const { status } = useSession();
    const router = useRouter();
    const { items, refresh } = useWishlist();

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') refresh();
    }, [status, refresh]);

    if (status === 'loading') {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900 mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-4xl font-bold mb-8 text-gray-900 flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500 fill-red-500" /> My Wishlist
            </h1>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                    <div className="text-6xl mb-4">💝</div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">Your wishlist is empty</h2>
                    <p className="text-gray-600 mb-6">Tap the heart on any product to save it here.</p>
                    <Link href="/products" className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all">
                        Browse products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((w) => (
                        <ProductCard key={w.id} product={w.product} />
                    ))}
                </div>
            )}
        </div>
    );
}
