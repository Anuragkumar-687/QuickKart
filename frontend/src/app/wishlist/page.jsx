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
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-foreground" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-6 py-10">
            <h1 className="mb-8 flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                <Heart className="h-8 w-8 fill-rose-500 text-rose-500" /> My Wishlist
            </h1>

            {items.length === 0 ? (
                <div className="card py-20 text-center">
                    <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-muted text-3xl">💝</div>
                    <h2 className="mb-2 text-xl font-bold text-foreground">Your wishlist is empty</h2>
                    <p className="mb-6 text-muted-foreground">Tap the heart on any product to save it here.</p>
                    <Link href="/products" className="btn btn-primary btn-md">Browse products</Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                    {items.map((w) => (
                        <ProductCard key={w.id} product={w.product} />
                    ))}
                </div>
            )}
        </div>
    );
}
