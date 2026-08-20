'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice, getDiscount, getStockState } from '../lib/format';
import { flyToCart } from './motion/flyToCart';
import RatingStars from './RatingStars';
import Badge from './Badge';

export default function ProductCard({ product, badge }) {
    const { data: session } = useSession();
    const router = useRouter();
    const { addToCart } = useCart();
    const { isWishlisted, toggle } = useWishlist();
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [error, setError] = useState('');
    const imageRef = useRef(null);

    const productId = product.id || product._id;
    const wished = isWishlisted(productId);
    const stock = getStockState(product.stock);
    const outOfStock = stock.level === 'out';

    // Only ever shows when the API actually sends an MRP — we don't invent one.
    const discount = getDiscount(product);

    const resolvedBadge =
        badge ||
        (discount && discount.percentOff >= 25
            ? { label: `${discount.percentOff}% off`, variant: 'savings' }
            : product.rating >= 4.7
              ? { label: 'Top rated', variant: 'top' }
              : null);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!session) return router.push('/login');
        setAdding(true);
        setError('');
        try {
            await addToCart(productId, 1);
            flyToCart(imageRef.current);
            setAdded(true);
            setTimeout(() => setAdded(false), 1600);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not add to cart');
            setTimeout(() => setError(''), 2600);
        } finally {
            setAdding(false);
        }
    };

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!session) return router.push('/login');
        try {
            await toggle(productId);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not update wishlist');
            setTimeout(() => setError(''), 2600);
        }
    };

    return (
        <div className="group card relative flex h-full flex-col overflow-hidden transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/25">
            <Link href={`/products/${productId}`} className="block">
                {/* Light plate: dark product cut-outs are unreadable on a dark card. */}
                <div className="plate relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                        ref={imageRef}
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
                        className="object-contain p-3 transition-transform duration-300 ease-out group-hover:scale-[1.06]"
                    />

                    {resolvedBadge && (
                        <div className="absolute left-2 top-2">
                            <Badge variant={resolvedBadge.variant}>{resolvedBadge.label}</Badge>
                        </div>
                    )}

                    {outOfStock && (
                        <div className="absolute inset-0 grid place-items-center bg-black/55">
                            <span className="rounded bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
                                Out of stock
                            </span>
                        </div>
                    )}
                </div>
            </Link>

            <button
                onClick={handleWishlist}
                aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={wished}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border bg-card/95 shadow-sm backdrop-blur transition-transform active:scale-90"
            >
                <motion.span
                    key={wished ? 'on' : 'off'}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 14 }}
                    className="grid place-items-center"
                >
                    <Heart className={`h-4 w-4 ${wished ? 'fill-current text-[var(--danger)]' : 'text-muted-foreground'}`} />
                </motion.span>
            </button>

            <div className="flex flex-1 flex-col p-3">
                {product.brand && (
                    <p className="mb-0.5 truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {product.brand}
                    </p>
                )}

                <Link href={`/products/${productId}`} className="min-w-0">
                    <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-medium leading-snug text-foreground transition-colors group-hover:text-[var(--primary)]">
                        {product.name}
                    </h3>
                </Link>

                {product.rating > 0 && (
                    <div className="mt-1.5">
                        <RatingStars rating={product.rating} count={product.ratingCount} />
                    </div>
                )}

                <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="price text-base text-foreground">{formatPrice(product.price)}</span>
                    {discount && (
                        <>
                            <span className="num text-xs text-muted-foreground line-through">
                                {formatPrice(discount.mrp)}
                            </span>
                            <span className="text-xs font-bold text-[var(--savings)]">
                                {discount.percentOff}% off
                            </span>
                        </>
                    )}
                </div>

                {stock.level === 'low' && (
                    <p className="mt-1 text-[11px] font-semibold text-[var(--danger)]">{stock.label}</p>
                )}

                <div className="mt-auto pt-2.5">
                    <button
                        onClick={handleAddToCart}
                        disabled={adding || outOfStock}
                        className={`btn btn-sm w-full ${added ? 'btn-buy' : 'btn-primary'}`}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {adding ? (
                                <motion.span key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1.5">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Adding
                                </motion.span>
                            ) : added ? (
                                <motion.span key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1.5">
                                    <Check className="h-4 w-4" /> Added
                                </motion.span>
                            ) : (
                                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1.5">
                                    <ShoppingCart className="h-4 w-4" />
                                    {outOfStock ? 'Unavailable' : 'Add to cart'}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </div>

            {/* Inline, non-blocking error — replaces the old alert() calls. */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        role="alert"
                        className="absolute inset-x-2 bottom-2 rounded bg-[var(--danger)] px-2 py-1.5 text-center text-[11px] font-semibold text-white shadow-lg"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
