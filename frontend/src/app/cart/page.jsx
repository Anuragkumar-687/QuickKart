'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

import { useCart } from '../../context/CartContext';

export default function CartPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const { fetchCartCount, updateQuantity } = useCart();
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await api.get('/cart');
                setCartItems(res.data.items || []);
                fetchCartCount(); // Sync count when viewing cart
            } catch (error) {
                console.error('Failed to fetch cart');
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchCart();
        }
    }, [status]);

    const handleRemoveItem = async (itemId) => {
        if (!confirm('Are you sure you want to remove this item from your cart?')) {
            return;
        }

        setRemovingId(itemId);
        try {
            const res = await api.delete(`/cart/${itemId}`);
            setCartItems(res.data.items || []);
            fetchCartCount(); // Update global count
        } catch (error) {
            alert('Failed to remove item');
        } finally {
            setRemovingId(null);
        }
    };

    const handleUpdateQty = async (itemId, newQty) => {
        if (newQty < 1) return;
        setUpdatingId(itemId);
        try {
            const res = await updateQuantity(itemId, newQty);
            // Since res is the updated cart model from backend:
            if (res && Array.isArray(res.items)) {
                setCartItems(res.items);
            } else if (res && res.data && Array.isArray(res.data.items)) {
                setCartItems(res.data.items);
            } else {
                // fall back to fetching cart
                const fetchRes = await api.get('/cart');
                setCartItems(fetchRes.data.items || []);
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message || 'Failed to update quantity';
            alert(`Could not update quantity: ${errMsg}`);
        } finally {
            setUpdatingId(null);
        }
    };

    const total = cartItems.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0
    );

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                    <div className="text-6xl mb-4">🛒</div>
                    <h1 className="text-3xl font-bold mb-4 text-gray-900">Your Cart is Empty</h1>
                    <p className="text-gray-600 mb-6">Start adding some amazing products!</p>
                    <Link
                        href="/products"
                        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8 text-gray-900">Shopping Cart</h1>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-100">
                <div className="p-6 space-y-6">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-6 last:border-b-0 last:pb-0 gap-4">
                            <div className="flex items-center space-x-4 flex-1">
                                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                    <Image
                                        src={item.product.image}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Link href={`/products/${item.product.id}`} className="font-bold text-lg hover:text-blue-600 transition-colors text-gray-900 block mb-1">
                                        {item.product.name}
                                    </Link>
                                    <p className="text-gray-600 font-medium">${item.product.price.toFixed(2)} each</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-6 sm:space-x-8">
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                        <button
                                            onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1 || updatingId === item.id}
                                            className="px-3 py-1 text-lg font-bold hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-50"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-1 text-gray-900 font-semibold min-w-[2rem] text-center bg-white border-x border-gray-200">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                                            disabled={item.quantity >= item.product.stock || updatingId === item.id}
                                            className="px-3 py-1 text-lg font-bold hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                    {item.product.stock - item.quantity <= 3 && (
                                        <span className="text-xs text-amber-600 font-semibold mt-1">
                                            Only {item.product.stock} available
                                        </span>
                                    )}
                                </div>
                                <span className="font-bold text-2xl text-gray-900 min-w-[100px] text-right">
                                    ${(item.product.price * item.quantity).toFixed(2)}
                                </span>
                                <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    disabled={removingId === item.id}
                                    className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Remove from cart"
                                >
                                    {removingId === item.id ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    ) : (
                                        <Trash2 className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-gray-50 p-6 border-t border-gray-200">
                    <div className="flex justify-between items-center max-w-md ml-auto">
                        <span className="text-2xl font-bold text-gray-900">Total:</span>
                        <span className="text-3xl font-bold text-blue-600">${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Link
                    href="/checkout"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                    Proceed to Checkout →
                </Link>
            </div>
        </div>
    );
}
