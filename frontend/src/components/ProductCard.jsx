'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import RatingStars from './RatingStars';
import Badge from './Badge';
import TiltCard from './motion/TiltCard';

export default function ProductCard({ product, badge }) {
    const { data: session } = useSession();
    const router = useRouter();
    const { addToCart } = useCart();
    const { isWishlisted, toggle } = useWishlist();
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);

    const productId = product.id || product._id;
    const wished = isWishlisted(productId);
    const outOfStock = product.stock != null && product.stock <= 0;
    const lowStock = !outOfStock && product.stock != null && product.stock <= 5;

    const resolvedBadge =
        badge ||
        (product.rating >= 4.7
            ? { label: 'Top Rated', variant: 'top' }
            : lowStock
              ? { label: `Only ${product.stock} left`, variant: 'stock' }
              : null);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        if (!session) return router.push('/login');
        setAdding(true);
        try {
            await addToCart(productId, 1);
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAdding(false);
        }
    };

    const handleWishlist = async (e) => {
        e.preventDefault();
        if (!session) return router.push('/login');
        try {
            await toggle(productId);
        } catch (err) {
            console.error('Wishlist error:', err);
            alert(err.response?.data?.message || 'Could not update your wishlist. Please try again.');
        }
    };

    return (
        <TiltCard className="group h-full">
            <div className="card relative h-full overflow-hidden transition-all duration-300 group-hover:border-accent/40 group-hover:shadow-[0_24px_70px_-24px_rgba(99,102,241,0.5)]">
                <Link href={`/products/${productId}`} className="block">
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width:768px) 50vw, 25vw"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        {resolvedBadge && (
                            <div className="absolute left-3 top-3">
                                <Badge variant={resolvedBadge.variant}>{resolvedBadge.label}</Badge>
                            </div>
                        )}
                        {outOfStock && (
                            <div className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-[2px]">
                                <span className="rounded-full bg-foreground px-4 py-1.5 text-sm font-semibold text-background">Sold out</span>
                            </div>
                        )}
                    </div>
                </Link>

                <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={handleWishlist}
                    aria-label="Toggle wishlist"
                    className="glass absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border shadow-md"
                >
                    <motion.span key={wished ? 'on' : 'off'} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}>
                        <Heart className={`h-[18px] w-[18px] ${wished ? 'fill-rose-500 text-rose-500' : 'text-foreground'}`} />
                    </motion.span>
                </motion.button>

                <div className="p-4 sm:p-5">
                    <Link href={`/products/${productId}`}>
                        <h3 className="mb-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
                            {product.name}
                        </h3>
                    </Link>
                    <p className="mb-2 line-clamp-1 text-xs text-muted-foreground">{product.category}</p>
                    {product.rating != null && (
                        <div className="mb-3">
                            <RatingStars rating={product.rating} count={product.ratingCount} />
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-lg font-bold tracking-tight text-foreground">${Number(product.price).toFixed(2)}</span>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleAddToCart}
                            disabled={adding || outOfStock}
                            aria-label="Add to cart"
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors duration-300 disabled:opacity-50 ${
                                added ? 'bg-success text-white' : 'bg-primary text-primary-foreground hover:opacity-90'
                            }`}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {added ? (
                                    <motion.span key="check" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
                                        <Check className="h-5 w-5" />
                                    </motion.span>
                                ) : (
                                    <motion.span key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                                        <ShoppingCart className="h-5 w-5" />
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </div>
            </div>
        </TiltCard>
    );
}
