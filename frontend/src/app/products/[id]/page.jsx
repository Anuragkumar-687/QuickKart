'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Heart, Minus, Plus, Star } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import RatingStars from '../../../components/RatingStars';

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const { addToCart } = useCart();
    const { isWishlisted, toggle } = useWishlist();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [bundles, setBundles] = useState([]);
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
    }, [id]);

    const loadReviews = useCallback(async () => {
        const res = await api.get(`/products/${id}/reviews`);
        setReviews(Array.isArray(res.data) ? res.data : []);
    }, [id]);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                await Promise.all([loadProduct(), loadReviews()]);
                api.get(`/recommendations/bundles/${id}?limit=4`)
                    .then((r) => setBundles(Array.isArray(r.data) ? r.data : []))
                    .catch(() => {});
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
        await toggle(product.id);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!session) return router.push('/login');
        setSubmittingReview(true);
        try {
            await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment });
            setReviewComment('');
            await Promise.all([loadReviews(), loadProduct()]); // refresh list + aggregate rating
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }
    if (error || !product) {
        return (
            <div className="text-center text-red-500 min-h-[50vh] flex items-center justify-center">
                {error || 'Product not found'}
            </div>
        );
    }

    const outOfStock = product.stock <= 0;
    const wished = isWishlisted(product.id);

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/2 relative h-96 md:h-[28rem] bg-gray-50">
                        <Image src={product.image} alt={product.name} fill className="object-contain p-6" sizes="(max-width: 768px) 100vw, 50vw" />
                    </div>
                    <div className="p-8 md:w-1/2">
                        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-2">
                            {product.category}{product.brand ? ` · ${product.brand}` : ''}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                        <div className="mb-4"><RatingStars rating={product.rating} count={product.ratingCount} size="lg" /></div>
                        <p className="text-gray-600 mb-6">{product.description}</p>

                        <div className="flex items-center mb-6 gap-4">
                            <span className="text-3xl font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
                            <span className={`px-3 py-1 rounded-full text-sm ${outOfStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                {outOfStock ? 'Out of Stock' : `${product.stock} in stock`}
                            </span>
                        </div>

                        {!outOfStock && (
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-sm font-medium text-gray-700">Quantity</span>
                                <div className="flex items-center border border-gray-300 rounded-full">
                                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2 hover:bg-gray-100 rounded-l-full" aria-label="Decrease">
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="px-4 font-semibold">{qty}</span>
                                    <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="p-2 hover:bg-gray-100 rounded-r-full" aria-label="Increase">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400"
                                disabled={outOfStock || adding}
                            >
                                {outOfStock ? 'Out of Stock' : adding ? 'Adding…' : 'Add to Cart'}
                            </button>
                            <button
                                onClick={handleWishlist}
                                aria-label="Toggle wishlist"
                                className="p-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                            >
                                <Heart className={`w-6 h-6 ${wished ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Frequently Bought Together */}
            {bundles.length > 0 && (
                <section className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Bought Together</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {bundles.map((b) => (
                            <Link key={b.id} href={`/products/${b.id}`} className="block bg-white border border-gray-100 rounded-lg p-3 hover:shadow-md transition">
                                <div className="relative h-32 w-full mb-2 bg-gray-50 rounded">
                                    <Image src={b.image} alt={b.name} fill className="object-contain p-2" sizes="25vw" />
                                </div>
                                <p className="text-sm font-medium text-gray-900 line-clamp-2">{b.name}</p>
                                <p className="text-sm font-bold text-gray-900 mt-1">${Number(b.price).toFixed(2)}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Reviews */}
            <section className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews ({reviews.length})</h2>

                {session ? (
                    <form onSubmit={handleSubmitReview} className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-8">
                        <p className="text-sm font-medium text-gray-700 mb-2">Your rating</p>
                        <div className="flex gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button type="button" key={n} onClick={() => setReviewRating(n)} aria-label={`${n} stars`}>
                                    <Star className={`w-7 h-7 ${n <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share your thoughts about this product..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                        <button
                            type="submit"
                            disabled={submittingReview}
                            className="mt-3 bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400"
                        >
                            {submittingReview ? 'Submitting…' : 'Submit Review'}
                        </button>
                    </form>
                ) : (
                    <p className="text-gray-600 mb-8">
                        <Link href="/login" className="text-indigo-600 font-medium">Sign in</Link> to write a review.
                    </p>
                )}

                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                    ) : (
                        reviews.map((r) => (
                            <div key={r.id} className="border-b border-gray-100 pb-4">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-gray-900">{r.user?.name || 'Anonymous'}</span>
                                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                                </div>
                                <RatingStars rating={r.rating} showValue={false} />
                                {r.comment && <p className="text-gray-600 mt-2">{r.comment}</p>}
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
