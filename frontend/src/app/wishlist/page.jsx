'use client';

import { useEffect } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';

export default function WishlistPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { wishlistItems, loading, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    const handleAddToCart = async (product) => {
        try {
            await addToCart(product.id, 1);
            alert('Added to cart!');
        } catch (error) {
            console.error('Add to cart error:', error);
            alert('Failed to add to cart');
        }
    };

    const handleRemove = async (productId) => {
        try {
            await removeFromWishlist(productId);
        } catch (error) {
            console.error('Remove from wishlist error:', error);
            alert('Failed to remove item');
        }
    };

    if (status === 'loading' || (loading && wishlistItems.length === 0)) {
        return (
            <div className="min-h-screen bg-white flex justify-center items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900"></div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return null;
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-12 max-w-md mx-auto">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-6">
                        <Heart className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-gray-900">Your Wishlist is Empty</h1>
                    <p className="text-gray-600 mb-8">Save items you like to view them here later!</p>
                    <Link
                        href="/products"
                        className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        Explore Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-10">
                <h1 className="text-4xl font-bold mb-2 text-gray-900">My Wishlist</h1>
                <p className="text-gray-600">You have <span className="font-semibold text-gray-900">{wishlistItems.length}</span> saved {wishlistItems.length === 1 ? 'item' : 'items'}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistItems.map((item) => {
                    const { product } = item;
                    if (!product) return null;

                    return (
                        <div key={item.id} className="group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                            {/* Image Container */}
                            <div className="relative h-64 w-full overflow-hidden bg-gray-50">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                />
                                <button
                                    onClick={() => handleRemove(product.id)}
                                    className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-600 p-2 rounded-full shadow-md transition-colors"
                                    title="Remove from Wishlist"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Details */}
                            <div className="p-5 flex flex-col flex-grow">
                                <Link href={`/products/${product.id}`} className="flex-grow">
                                    <h3 className="text-base font-semibold mb-2 text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
                                        {product.name}
                                    </h3>
                                </Link>
                                <p className="text-sm text-gray-500 mb-4">{product.category}</p>
                                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                                    <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.stock === 0}
                                        className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all disabled:bg-gray-200 disabled:text-gray-400 flex items-center gap-1.5"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        <span>Add</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
