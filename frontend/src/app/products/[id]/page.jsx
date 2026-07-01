'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../../lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Minus, Plus, Star, ShoppingCart, Truck, ShieldCheck, RefreshCcw, ChevronRight, ChevronLeft } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import RatingStars from '../../../components/RatingStars';
import ProductCard from '../../../components/ProductCard';
import Reveal from '../../../components/motion/Reveal';

function Carousel({ title, products }) {
    const ref = useRef(null);
    if (!products || products.length === 0) return null;
    const scroll = (dir) => ref.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
    return (
        <section className="mt-16">
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
                <div className="hidden gap-2 sm:flex">
                    <button onClick={() => scroll(-1)} className="grid h-9 w-9 place-items-center rounded-full border hover:bg-muted" aria-label="Scroll left"><ChevronLeft className="h-4 w-4" /></button>
                    <button onClick={() => scroll(1)} className="grid h-9 w-9 place-items-center rounded-full border hover:bg-muted" aria-label="Scroll right"><ChevronRight className="h-4 w-4" /></button>
                </div>
            </div>
            <div ref={ref} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
                {products.map((p) => (
                    <div key={p.id} className="w-56 shrink-0 snap-start sm:w-64">
                        <ProductCard product={p} />
                    </div>
                ))}
            </div>
        </section>
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

    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

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
                api.get(`/recommendations/bundles/${id}?limit=6`).then((r) => setBundles(Array.isArray(r.data) ? r.data : [])).catch(() => {});
                if (p?.category) {
                    api.get(`/products?category=${encodeURIComponent(p.category)}&limit=12`)
                        .then((r) => setRelated((r.data.data || []).filter((x) => x.id !== id)))
                        .catch(() => {});
                }
            } catch (err) {
                setError('Failed to load product');
            } finally {
                setLoading(false);
            }
        })();
    }, [id, loadProduct, loadReviews]);

    const handleAddToCart = async () => {
        if (!session) return router.push('/login');
        setAdding(true);
        try {
            await addToCart(product.id, qty);
            router.push('/cart');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAdding(false);
        }
    };

    const handleWishlist = async () => {
        if (!session) return router.push('/login');
        try {
            await toggle(product.id);
        } catch (err) {
            alert(err.response?.data?.message || 'Could not update your wishlist. Please try again.');
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
            alert(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="grid gap-10 md:grid-cols-2">
                    <div className="skeleton aspect-square w-full rounded-2xl" />
                    <div className="space-y-4 py-4">
                        <div className="skeleton h-4 w-24 rounded" />
                        <div className="skeleton h-9 w-3/4 rounded" />
                        <div className="skeleton h-5 w-40 rounded" />
                        <div className="skeleton h-24 w-full rounded" />
                        <div className="skeleton h-12 w-full rounded-full" />
                    </div>
                </div>
            </div>
        );
    }
    if (error || !product) {
        return <div className="flex min-h-[50vh] items-center justify-center text-danger">{error || 'Product not found'}</div>;
    }

    const outOfStock = product.stock <= 0;
    const wished = isWishlisted(product.id);

    return (
        <div className="mx-auto max-w-6xl px-6 py-8">
            <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link href="/products" className="hover:text-foreground">Products</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="truncate text-foreground">{product.name}</span>
            </nav>

            <div className="grid gap-10 md:grid-cols-2">
                {/* Image */}
                <div className="md:sticky md:top-24 md:self-start">
                    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="group relative aspect-square w-full overflow-hidden rounded-2xl border bg-muted">
                        <Image src={product.image} alt={product.name} fill className="object-contain p-8 transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
                        <div aria-hidden className="pointer-events-none absolute -bottom-20 left-1/2 h-40 w-3/4 -translate-x-1/2 rounded-full bg-accent/20 blur-[80px]" />
                    </motion.div>
                </div>

                {/* Buy box */}
                <div>
                    <Reveal y={16}><p className="text-sm font-medium uppercase tracking-wide text-accent">{product.category}{product.brand ? ` · ${product.brand}` : ''}</p></Reveal>
                    <Reveal y={16} delay={0.05}><h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">{product.name}</h1></Reveal>
                    <Reveal y={16} delay={0.1}><div className="mt-3"><RatingStars rating={product.rating} count={product.ratingCount} size="lg" /></div></Reveal>
                    <Reveal y={16} delay={0.15}>
                        <div className="mt-6 flex items-center gap-4">
                            <span className="text-4xl font-bold tracking-tight text-foreground">${Number(product.price).toFixed(2)}</span>
                            <span className={`rounded-full px-3 py-1 text-sm font-medium ${outOfStock ? 'bg-rose-500/10 text-danger' : 'bg-emerald-500/10 text-emerald-400'}`}>{outOfStock ? 'Out of stock' : `${product.stock} in stock`}</span>
                        </div>
                    </Reveal>
                    <Reveal y={16} delay={0.2}><p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p></Reveal>

                    {!outOfStock && (
                        <Reveal y={16} delay={0.25}>
                            <div className="mt-8 flex items-center gap-4">
                                <span className="text-sm font-medium text-foreground">Quantity</span>
                                <div className="flex items-center rounded-full border">
                                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center rounded-l-full hover:bg-muted" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                                    <span className="w-10 text-center font-semibold">
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            <motion.span key={qty} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.18 }} className="inline-block">{qty}</motion.span>
                                        </AnimatePresence>
                                    </span>
                                    <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="grid h-10 w-10 place-items-center rounded-r-full hover:bg-muted" aria-label="Increase"><Plus className="h-4 w-4" /></button>
                                </div>
                            </div>
                        </Reveal>
                    )}

                    <Reveal y={16} delay={0.3}>
                        <div className="mt-6 flex gap-3">
                            <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddToCart} disabled={outOfStock || adding} className="btn btn-accent btn-lg flex-1">
                                <ShoppingCart className="h-5 w-5" />{outOfStock ? 'Out of Stock' : adding ? 'Adding…' : 'Add to Cart'}
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.9 }} onClick={handleWishlist} aria-label="Toggle wishlist" className="btn btn-outline btn-lg !px-4">
                                <motion.span key={wished ? 'on' : 'off'} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}>
                                    <Heart className={`h-6 w-6 ${wished ? 'fill-rose-500 text-rose-500' : ''}`} />
                                </motion.span>
                            </motion.button>
                        </div>
                    </Reveal>

                    <Reveal y={16} delay={0.35}>
                        <div className="mt-8 grid grid-cols-3 gap-3 border-t pt-6 text-center">
                            {[[Truck, 'Fast delivery'], [ShieldCheck, 'Secure payment'], [RefreshCcw, 'Easy returns']].map(([Icon, label]) => (
                                <div key={label} className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                                    <Icon className="h-5 w-5 text-foreground" />{label}
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </div>

            {/* Frequently bought together */}
            {bundles.length > 0 && (
                <Reveal as="section" className="mt-16">
                    <h2 className="mb-5 text-2xl font-bold tracking-tight text-foreground">Frequently Bought Together</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {bundles.slice(0, 4).map((b) => (
                            <Link key={b.id} href={`/products/${b.id}`} className="card card-hover block overflow-hidden p-3">
                                <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-muted"><Image src={b.image} alt={b.name} fill className="object-contain p-3" sizes="25vw" /></div>
                                <p className="line-clamp-2 text-sm font-medium text-foreground">{b.name}</p>
                                <p className="mt-1 text-sm font-bold text-foreground">${Number(b.price).toFixed(2)}</p>
                            </Link>
                        ))}
                    </div>
                </Reveal>
            )}

            {/* Related carousel */}
            <Carousel title="You may also like" products={related} />

            {/* Reviews */}
            <Reveal as="section" className="mt-16">
                <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">Reviews ({reviews.length})</h2>

                {session ? (
                    <form onSubmit={handleSubmitReview} className="card mb-8 p-6">
                        <p className="mb-2 text-sm font-medium text-foreground">Your rating</p>
                        <div className="mb-3 flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <motion.button whileTap={{ scale: 0.8 }} type="button" key={n} onClick={() => setReviewRating(n)} aria-label={`${n} stars`}>
                                    <Star className={`h-7 w-7 transition-colors ${n <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                                </motion.button>
                            ))}
                        </div>
                        <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Share your thoughts about this product..." rows={3} className="input" />
                        <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={submittingReview} className="btn btn-primary btn-md mt-3">{submittingReview ? 'Submitting…' : 'Submit Review'}</motion.button>
                    </form>
                ) : (
                    <p className="mb-8 text-muted-foreground"><Link href="/login" className="font-medium text-accent hover:underline">Sign in</Link> to write a review.</p>
                )}

                <div className="space-y-5">
                    {reviews.length === 0 ? (
                        <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                    ) : (
                        reviews.map((r, i) => (
                            <Reveal key={r.id} delay={Math.min(i * 0.05, 0.3)} y={16}>
                                <div className="border-b pb-5 last:border-0">
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="font-semibold text-foreground">{r.user?.name || 'Anonymous'}</span>
                                        <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <RatingStars rating={r.rating} showValue={false} />
                                    {r.comment && <p className="mt-2 text-muted-foreground">{r.comment}</p>}
                                </div>
                            </Reveal>
                        ))
                    )}
                </div>
            </Reveal>
        </div>
    );
}
