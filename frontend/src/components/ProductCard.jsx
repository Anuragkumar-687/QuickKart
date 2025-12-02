'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function ProductCard({ product }) {
    const { data: session } = useSession();
    const router = useRouter();
    const { addToCart } = useCart();
    const cardRef = useRef(null);

    useEffect(() => {
        const card = cardRef.current;

        // Hover animation
        const handleMouseEnter = () => {
            gsap.to(card.querySelector('.product-image'), {
                scale: 1.05,
                duration: 0.4,
                ease: 'power2.out'
            });
            gsap.to(card, {
                y: -8,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                duration: 0.3,
                ease: 'power2.out'
            });
        };

        const handleMouseLeave = () => {
            gsap.to(card.querySelector('.product-image'), {
                scale: 1,
                duration: 0.4,
                ease: 'power2.out'
            });
            gsap.to(card, {
                y: 0,
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                duration: 0.3,
                ease: 'power2.out'
            });
        };

        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mouseenter', handleMouseEnter);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        if (!session) {
            router.push('/login');
            return;
        }

        try {
            console.log('Attempting to add product:', product);
            await addToCart(product.id || product._id, 1);
            alert('Added to cart!');
        } catch (error) {
            console.error('Add to cart error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to add to cart';
            alert(`Failed to add to cart: ${errorMessage}`);
        }
    };

    return (
        <div ref={cardRef} className="product-card group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="relative h-72 w-full overflow-hidden bg-gray-50">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="product-image object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
            </div>
            <div className="p-5">
                <Link href={`/products/${product._id}`}>
                    <h3 className="text-base font-semibold mb-2 text-gray-900 hover:text-gray-600 transition-colors line-clamp-2 min-h-[3rem]">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-sm text-gray-500 mb-3 line-clamp-1">{product.category}</p>
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                    <button
                        onClick={handleAddToCart}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all active:scale-95 transform shadow-sm hover:shadow-md"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
