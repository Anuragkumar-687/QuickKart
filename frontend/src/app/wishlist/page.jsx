'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/ProductCard';
import { formatCount } from '../../lib/format';

export default function WishlistPage() {
    const { status } = useSession();
    const router = useRouter();
    const { items, refresh } = useWishlist();

    useEffect(() => {
        if (status === 'unauthenticated') router.replace('/login');
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') refresh();
    }, [status, refresh]);

    if (status === 'loading') {
        return (
            <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Loading wishlist">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-[var(--primary)]" />
                <span className="sr-only">Loading wishlist</span>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
            <div className="card overflow-hidden">
                <div className="flex items-baseline justify-between border-b px-4 py-3.5 sm:px-5">
                    <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight select-none">
                        <Heart className="h-5 w-5 fill-current text-[var(--danger)]" />
                        My wishlist
                    </h1>
                    {items.length > 0 && (
                        <span className="num text-sm text-muted-foreground">
                            {formatCount(items.length)} item{items.length === 1 ? '' : 's'}
                        </span>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-muted">
                            <Heart className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h2 className="mb-1.5 text-lg font-bold">Your wishlist is empty</h2>
                        <p className="mb-5 text-sm text-muted-foreground">
                            Tap the heart on any product to save it here.
                        </p>
                        <Link href="/products" className="btn btn-primary btn-md">Browse products</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {items.map((w) => (
                            <div key={w.id} className="bg-card p-2">
                                <ProductCard product={w.product} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
