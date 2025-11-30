'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface CartItem {
    product: {
        _id: string;
        name: string;
        price: number;
        image: string;
    };
    quantity: number;
    _id: string;
}

export default function CartPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);

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

    const handleRemoveItem = async (itemId: string) => {
        if (!confirm('Are you sure you want to remove this item from your cart?')) {
            return;
        }

        setRemovingId(itemId);
        try {
            const res = await api.delete(`/cart/${itemId}`);
            setCartItems(res.data.items || []);
        } catch (error) {
            alert('Failed to remove item');
        } finally {
            setRemovingId(null);
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
                        <div key={item._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-6 last:border-b-0 last:pb-0 gap-4">
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
                                    <Link href={`/products/${item.product._id}`} className="font-bold text-lg hover:text-blue-600 transition-colors text-gray-900 block mb-1">
                                        {item.product.name}
                                    </Link>
                                    <p className="text-gray-600 font-medium">${item.product.price.toFixed(2)} each</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-6 sm:space-x-8">
                                <div className="bg-gray-50 px-4 py-2 rounded-lg">
                                    <span className="text-gray-700 font-semibold">Qty: <span className="text-blue-600">{item.quantity}</span></span>
                                </div>
                                <span className="font-bold text-2xl text-gray-900 min-w-[100px] text-right">
                                    ${(item.product.price * item.quantity).toFixed(2)}
                                </span>
                                <button
                                    onClick={() => handleRemoveItem(item._id)}
                                    disabled={removingId === item._id}
                                    className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Remove from cart"
                                >
                                    {removingId === item._id ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    ) : (
                                        <Trash2 className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-t-2 border-gray-200">
                    <div className="flex justify-between items-center max-w-md ml-auto">
                        <span className="text-2xl font-bold text-gray-900">Total:</span>
                        <span className="text-3xl font-bold text-blue-600">${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Link
                    href="/checkout"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105"
                >
                    Proceed to Checkout →
                </Link>
            </div>
        </div>
    );
}
