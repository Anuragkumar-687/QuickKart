'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../../lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Minus, Plus, Star, ShoppingCart, Truck, ShieldCheck, RotateCcw,
    ChevronRight, Check, Loader2, MapPin,
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import RatingStars from '../../../components/RatingStars';
import ProductRail from '../../../components/ProductRail';
import { formatPrice, formatCount, getDiscount, getStockState } from '../../../lib/format';
import { flyToCart } from '../../../components/motion/flyToCart';

/** Distribution bar for one star level. */
function RatingBar({ star, count, total }) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="num w-3 text-muted-foreground">{star}</span>
            <Star className="h-3 w-3 fill-current text-muted-foreground" />
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: [0.25, 0.8, 0.3, 1] }}
                    className="block h-full rounded-full"
                    style={{ backgroundColor: 'var(--savings)' }}
                />
            </span>
            <span className="num w-8 text-right text-muted-foreground">{count}</span>
        </div>
    );
}

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const { addToCart } = useCart();
    const { isWishlisted, toggle } = useWishlist();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [bundles, setBundles] = useState([]);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [notice, setNotice] = useState('');

    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const imageRef = useRef(null);

    const id = params.id;

    const loadProduct = useCallback(async () => {
        const res = await api.get(`/products/${id}`); // also records a view server-side
        setProduct(res.data);
        return res.data;
    }, [id]);

    const loadReviews = useCallback(async () => {
        const res = await api.get(`/products/${id}/reviews`);
        setReviews(Array.isArray(res.data) ? res.data : []);
    }, [id]);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const [p] = await Promise.all([loadProduct(), loadReviews()]);
                api.get(`/recommendations/bundles/${id}?limit=6`)
                    .then((r) => setBundles(Array.isArray(r.data) ? r.data : []))
                    .catch(() => {});
                if (p?.category) {
                    api.get(`/products?category=${encodeURIComponent(p.category)}&limit=12`)
                        .then((r) => setRelated((r.data.data || []).filter((x) => x.id !== id)))
                        .catch(() => {});
                }
            } catch {
                setError('Failed to load product');
            } finally {
                setLoading(false);
            }
        })();
    }, [id, loadProduct, loadReviews]);

    const flash = (msg) => {
        setNotice(msg);
        setTimeout(() => setNotice(''), 3000);
    };

    const handleAddToCart = async () => {
        if (!session) return router.push('/login');
        setAdding(true);
        try {
            await addToCart(product.id, qty);
            flyToCart(imageRef.current);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        } catch (err) {
            flash(err.response?.data?.message || 'Could not add to cart');
        } finally {
            setAdding(false);
        }
    };

    const handleBuyNow = async () => {
        if (!session) return router.push('/login');
        setAdding(true);
        try {
            await addToCart(product.id, qty);
            router.push('/cart');
        } catch (err) {
            flash(err.response?.data?.message || 'Could not add to cart');
            setAdding(false);
        }
    };

    const handleWishlist = async () => {
        if (!session) return router.push('/login');
        try {
            await toggle(product.id);
        } catch (err) {
            flash(err.response?.data?.message || 'Could not update wishlist');
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!session) return router.push('/login');
        setSubmittingReview(true);
        try {
            await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment });
            setReviewComment('');
            await Promise.all([loadReviews(), loadProduct()]);
        } catch (err) {
            flash(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6">
                <div className="card grid gap-8 p-5 lg:grid-cols-[minmax(0,420px)_1fr]">
                    <div className="skeleton aspect-square w-full rounded-xl" />
                    <div className="space-y-4 py-2">
                        <div className="skeleton h-3 w-24 rounded" />
                        <div className="skeleton h-7 w-3/4 rounded" />
                        <div className="skeleton h-5 w-40 rounded" />
                        <div className="skeleton h-10 w-32 rounded" />
                        <div className="skeleton h-24 w-full rounded" />
                        <div className="skeleton h-12 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="mx-auto max-w-md px-6 py-24 text-center">
                <p className="text-lg font-semibold text-[var(--danger)]">{error || 'Product not found'}</p>
                <Link href="/products" className="btn btn-primary btn-md mt-5">Browse products</Link>
            </div>
        );
    }

    const stock = getStockState(product.stock);
    const outOfStock = stock.level === 'out';
    const wished = isWishlisted(product.id);
    const discount = getDiscount(product);
    const region = session?.user?.region;

    const distribution = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
    }));

    return (
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
            <nav className="mb-3 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <Link href="/products" className="hover:text-foreground">Products</Link>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="capitalize hover:text-foreground">
                    {product.category}
                </Link>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <span className="truncate text-foreground">{product.name}</span>
            </nav>

            <div className="card grid gap-6 p-4 sm:p-5 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-8">
                {/* Gallery — sticky on desktop so the image stays with the buy box. */}
                <div className="lg:sticky lg:top-[124px] lg:self-start">
                    <div className="plate relative aspect-square w-full overflow-hidden rounded-xl border">
                        <Image
                            ref={imageRef}
                            src={product.image}
                            alt={product.name}
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 420px"
                            className="object-contain p-6"
                        />
                        {discount && (
                            <span
                                style={{ backgroundColor: 'var(--savings)', color: 'var(--savings-foreground)' }}
                                className="absolute left-3 top-3 rounded px-2 py-1 text-[11px] font-bold"
                            >
                                {discount.percentOff}% off
                            </span>
                        )}
                    </div>

                    <div className="mt-3 flex gap-2.5">
                        <button
                            onClick={handleAddToCart}
                            disabled={outOfStock || adding}
                            className={`btn btn-md flex-1 ${added ? 'btn-buy' : 'btn-secondary'}`}
                        >
                            {adding ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Adding</>
                            ) : added ? (
                                <><Check className="h-4 w-4" /> Added to cart</>
                            ) : (
                                <><ShoppingCart className="h-4 w-4" /> Add to cart</>
                            )}
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={outOfStock || adding}
                            className="btn btn-primary btn-md flex-1"
                        >
                            Buy now
                        </button>
                    </div>
                </div>

                {/* Buy box */}
                <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {product.brand ? `${product.brand} · ` : ''}
                            <span className="capitalize">{product.category}</span>
                        </p>
                        <button
                            onClick={handleWishlist}
                            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                            aria-pressed={wished}
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition hover:bg-muted"
                        >
                            <Heart className={`h-5 w-5 ${wished ? 'fill-current text-[var(--danger)]' : 'text-muted-foreground'}`} />
                        </button>
                    </div>

                    <h1 className="mt-1.5 text-xl font-bold leading-snug tracking-tight text-foreground sm:text-2xl">
                        {product.name}
                    </h1>

                    {product.rating > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                            <RatingStars rating={product.rating} count={product.ratingCount} />
                            <span className="text-xs text-muted-foreground">
                                {formatCount(reviews.length)} review{reviews.length === 1 ? '' : 's'}
                            </span>
                        </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="price text-3xl text-foreground">{formatPrice(product.price)}</span>
                        {discount && (
                            <>
                                <span className="num text-base text-muted-foreground line-through">
                                    {formatPrice(discount.mrp)}
                                </span>
                                <span className="text-base font-bold text-[var(--savings)]">
                                    {discount.percentOff}% off
                                </span>
                            </>
                        )}
                    </div>

                    <p
                        className="mt-2 text-sm font-semibold"
                        style={{ color: outOfStock ? 'var(--danger)' : 'var(--savings)' }}
                    >
                        {outOfStock
                            ? 'Currently out of stock'
                            : stock.level === 'low'
                              ? stock.label
                              : `In stock (${formatCount(product.stock)} available)`}
                    </p>

                    {/* Delivery — states the general policy rather than promising a
                        specific date the backend can't actually commit to. */}
                    <div className="mt-4 flex items-start gap-2.5 rounded-lg border bg-muted/40 p-3">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="text-[13px]">
                            {region ? (
                                <p className="font-semibold text-foreground">Delivering to {region} India</p>
                            ) : (
                                <p className="font-semibold text-foreground">
                                    <Link href="/login" className="text-[var(--info)] hover:underline">Sign in</Link>{' '}
                                    to see delivery options for your area
                                </p>
                            )}
                            <p className="mt-0.5 text-muted-foreground">
                                Standard delivery on eligible orders. Returns accepted per our returns policy.
                            </p>
                        </div>
                    </div>

                    {!outOfStock && (
                        <div className="mt-5 flex items-center gap-3">
                            <span className="text-sm font-semibold text-foreground">Quantity</span>
                            <div className="flex items-center rounded-lg border">
                                <button
                                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                                    disabled={qty <= 1}
                                    className="grid h-9 w-9 place-items-center rounded-l-lg transition hover:bg-muted disabled:opacity-40"
                                    aria-label="Decrease quantity"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="num w-10 text-center text-sm font-bold" aria-live="polite">
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        <motion.span
                                            key={qty}
                                            initial={{ y: 8, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -8, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="inline-block"
                                        >
                                            {qty}
                                        </motion.span>
                                    </AnimatePresence>
                                </span>
                                <button
                                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                                    disabled={qty >= product.stock}
                                    className="grid h-9 w-9 place-items-center rounded-r-lg transition hover:bg-muted disabled:opacity-40"
                                    aria-label="Increase quantity"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            {qty > 1 && (
                                <span className="num text-sm text-muted-foreground">
                                    Total {formatPrice(product.price * qty)}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="mt-5 grid grid-cols-3 gap-2 border-y py-4">
                        {[
                            [Truck, 'Free delivery', 'On eligible orders'],
                            [ShieldCheck, 'Secure payment', 'Protected checkout'],
                            [RotateCcw, 'Easy returns', 'Per returns policy'],
                        ].map(([Icon, label, sub]) => (
                            <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                                <Icon className="h-5 w-5 text-[var(--primary)]" />
                                <span className="text-[11px] font-semibold text-foreground">{label}</span>
                                <span className="text-[10px] leading-tight text-muted-foreground">{sub}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5">
                        <h2 className="mb-2 text-sm font-bold text-foreground">Product description</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
                    </div>
                </div>
            </div>

            {/* Bundles */}
            {bundles.length > 0 && (
                <ProductRail
                    title="Frequently bought together"
                    products={bundles}
                    loading={false}
                />
            )}

            {/* Related */}
            <ProductRail
                title="Similar products"
                subtitle={`More in ${product.category}`}
                products={related}
                loading={false}
                href={`/products?category=${encodeURIComponent(product.category)}`}
            />

            {/* Reviews */}
            <section className="mx-auto max-w-[1400px] py-4">
                <div className="card overflow-hidden">
                    <h2 className="border-b px-5 py-3.5 text-lg font-bold tracking-tight">
                        Ratings &amp; reviews
                    </h2>

                    <div className="grid gap-6 p-5 lg:grid-cols-[220px_1fr]">
                        <div className="shrink-0">
                            <div className="flex items-baseline gap-2">
                                <span className="num text-4xl font-extrabold">{Number(product.rating || 0).toFixed(1)}</span>
                                <Star className="h-6 w-6 fill-current text-[var(--savings)]" />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {formatCount(product.ratingCount || 0)} ratings &middot; {formatCount(reviews.length)} reviews
                            </p>
                            <div className="mt-4 space-y-1.5">
                                {distribution.map((d) => (
                                    <RatingBar key={d.star} star={d.star} count={d.count} total={reviews.length} />
                                ))}
                            </div>
                        </div>

                        <div className="min-w-0">
                            {session ? (
                                <form onSubmit={handleSubmitReview} className="mb-6 rounded-lg border p-4">
                                    <p className="mb-2 text-sm font-semibold text-foreground">Rate this product</p>
                                    <div className="mb-3 flex gap-1">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <motion.button
                                                whileTap={{ scale: 0.8 }}
                                                type="button"
                                                key={n}
                                                onClick={() => setReviewRating(n)}
                                                aria-label={`${n} star${n === 1 ? '' : 's'}`}
                                            >
                                                <Star
                                                    className={`h-7 w-7 transition-colors ${
                                                        n <= reviewRating
                                                            ? 'fill-current text-[var(--warning)]'
                                                            : 'text-border-strong'
                                                    }`}
                                                />
                                            </motion.button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder="What did you like or dislike about this product?"
                                        rows={3}
                                        className="input"
                                    />
                                    <button type="submit" disabled={submittingReview} className="btn btn-primary btn-md mt-3">
                                        {submittingReview ? (
                                            <><Loader2 className="h-4 w-4 animate-spin" /> Submitting</>
                                        ) : (
                                            'Submit review'
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <p className="mb-6 text-sm text-muted-foreground">
                                    <Link href="/login" className="font-semibold text-[var(--info)] hover:underline">
                                        Sign in
                                    </Link>{' '}
                                    to write a review.
                                </p>
                            )}

                            <div className="space-y-4">
                                {reviews.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No reviews yet. Be the first to review this product.
                                    </p>
                                ) : (
                                    reviews.map((r) => (
                                        <div key={r.id} className="border-b pb-4 last:border-0 last:pb-0">
                                            <div className="mb-1.5 flex items-center gap-2">
                                                <RatingStars rating={r.rating} />
                                                <span className="text-sm font-semibold text-foreground">
                                                    {r.user?.name || 'Anonymous'}
                                                </span>
                                                <span className="ml-auto text-xs text-muted-foreground">
                                                    {new Date(r.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                            {r.comment && (
                                                <p className="text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Non-blocking notice, replacing the old alert() calls. */}
            <AnimatePresence>
                {notice && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        role="alert"
                        className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[var(--danger)] px-4 py-2.5 text-sm font-semibold text-white shadow-2xl"
                    >
                        {notice}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
