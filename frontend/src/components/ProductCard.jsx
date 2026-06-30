'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import RatingStars from './RatingStars';
import gsap from 'gsap';

export default function ProductCard({ product }) {
    const { data: session } = useSession();
    const router = useRouter();
    const { addToCart } = useCart();
    const { isWishlisted, toggle } = useWishlist();
    const cardRef = useRef(null);
    const [adding, setAdding] = useState(false);

    // Prisma maps Mongo _id -> id, so `id` is canonical. Keep _id as a fallback.
    const productId = product.id || product._id;
    const wished = isWishlisted(productId);
    const outOfStock = product.stock != null && product.stock <= 0;

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;
        const img = card.querySelector('.product-image');
        const onEnter = () => {
            gsap.to(img, { scale: 1.05, duration: 0.4, ease: 'power2.out' });
            gsap.to(card, { y: -8, duration: 0.3, ease: 'power2.out' });
        };
        const onLeave = () => {
            gsap.to(img, { scale: 1, duration: 0.4, ease: 'power2.out' });
            gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out' });
        };
        card.addEventListener('mouseenter', onEnter);
        card.addEventListener('mouseleave', onLeave);
        return () => {
            card.removeEventListener('mouseenter', onEnter);
            card.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        if (!session) {
            router.push('/login');
            return;
        }
        setAdding(true);
        try {
            await addToCart(productId, 1);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAdding(false);
        }
    };

    const handleWishlist = async (e) => {
        e.preventDefault();
        if (!session) {
            router.push('/login');
            return;
        }
        try {
            await toggle(productId);
        } catch (_) {
            /* ignore */
        }
    };

    return (
        <div ref={cardRef} className="product-card group bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm">
            <div className="relative h-72 w-full overflow-hidden bg-gray-50">
                <Link href={`/products/${productId}`}>
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="product-image object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                </Link>
                <button
                    onClick={handleWishlist}
                    aria-label="Toggle wishlist"
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur shadow hover:scale-110 transition-transform"
                >
                    <Heart className={`w-5 h-5 ${wished ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
                </button>
                {outOfStock && (
                    <span className="absolute top-3 left-3 bg-gray-900 text-white text-xs px-2 py-1 rounded-full">
                        Out of stock
                    </span>
                )}
            </div>
            <div className="p-5">
                <Link href={`/products/${productId}`}>
                    <h3 className="text-base font-semibold mb-1 text-gray-900 hover:text-gray-600 transition-colors line-clamp-2 min-h-[3rem]">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-sm text-gray-500 mb-2 line-clamp-1">{product.category}</p>
                {product.rating != null && (
                    <div className="mb-3">
                        <RatingStars rating={product.rating} count={product.ratingCount} />
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
                    <button
                        onClick={handleAddToCart}
                        disabled={adding || outOfStock}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {adding ? 'Adding…' : outOfStock ? 'Sold out' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
}
