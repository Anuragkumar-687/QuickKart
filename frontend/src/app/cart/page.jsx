'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Trash2, Minus, Plus, Bookmark, ArrowUpToLine } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
    const { status } = useSession();
    const router = useRouter();
    const { getCart, updateQuantity, removeItem, saveForLater, moveToCart } = useCart();

    const [cart, setCart] = useState({ items: [], savedItems: [], summary: { subtotal: 0 } });
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [notice, setNotice] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
    }, [status, router]);

    useEffect(() => {
        if (status !== 'authenticated') return;
        getCart()
            .then((data) => setCart(normalize(data)))
            .catch(() => setNotice('Failed to load cart'))
            .finally(() => setLoading(false));
    }, [status, getCart]);

    const normalize = (data) => ({
        items: data?.items || [],
        savedItems: data?.savedItems || [],
        summary: data?.summary || { subtotal: 0 },
    });

    const run = async (id, fn) => {
        setBusyId(id);
        setNotice('');
        try {
            const updated = await fn();
            setCart(normalize(updated));
        } catch (err) {
            setNotice(err.response?.data?.message || 'Something went wrong');
        } finally {
            setBusyId(null);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900 mx-auto"></div>
            </div>
        );
    }

    const { items, savedItems, summary } = cart;

    if (items.length === 0 && savedItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                    <div className="text-6xl mb-4">🛒</div>
                    <h1 className="text-3xl font-bold mb-4 text-gray-900">Your Cart is Empty</h1>
                    <p className="text-gray-600 mb-6">Start adding some amazing products!</p>
                    <Link href="/products" className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-gray-900">Shopping Cart</h1>

            {notice && (
                <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">{notice}</div>
            )}

            {/* Active items */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 border border-gray-100">
                <div className="p-6 space-y-6">
                    {items.length === 0 && <p className="text-gray-500 text-center py-4">No active items. Check your saved items below.</p>}
                    {items.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-6 last:border-b-0 last:pb-0 gap-4">
                            <div className="flex items-center space-x-4 flex-1">
                                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                    <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="96px" />
                                </div>
                                <div className="flex-1">
                                    <Link href={`/products/${item.product.id}`} className="font-bold text-lg hover:text-indigo-600 transition-colors text-gray-900 block mb-1">
                                        {item.product.name}
                                    </Link>
                                    <p className="text-gray-600 font-medium">${item.product.price.toFixed(2)} each</p>
                                    <p className="text-xs text-gray-400">{item.product.stock} in stock</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 sm:gap-6">
                                <div className="flex items-center border border-gray-300 rounded-full">
                                    <button onClick={() => run(item.id, () => updateQuantity(item.id, item.quantity - 1))} disabled={busyId === item.id} className="p-2 hover:bg-gray-100 rounded-l-full disabled:opacity-40" aria-label="Decrease">
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="px-3 font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                                    <button onClick={() => run(item.id, () => updateQuantity(item.id, item.quantity + 1))} disabled={busyId === item.id} className="p-2 hover:bg-gray-100 rounded-r-full disabled:opacity-40" aria-label="Increase">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <span className="font-bold text-xl text-gray-900 min-w-[90px] text-right">
                                    ${(item.product.price * item.quantity).toFixed(2)}
                                </span>
                                <div className="flex gap-1">
                                    <button onClick={() => run(item.id, () => saveForLater(item.id))} disabled={busyId === item.id} title="Save for later" className="p-2.5 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40">
                                        <Bookmark className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => run(item.id, () => removeItem(item.id))} disabled={busyId === item.id} title="Remove" className="p-2.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-40">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {items.length > 0 && (
                    <div className="bg-gray-50 p-6 border-t border-gray-200">
                        <div className="flex justify-between items-center max-w-md ml-auto">
                            <span className="text-2xl font-bold text-gray-900">Subtotal:</span>
                            <span className="text-3xl font-bold text-indigo-600">${summary.subtotal.toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </div>

            {items.length > 0 && (
                <div className="flex justify-end mb-10">
                    <Link href="/checkout" className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                        Proceed to Checkout →
                    </Link>
                </div>
            )}

            {/* Saved for later */}
            {savedItems.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Saved for later ({savedItems.length})</h2>
                    </div>
                    <div className="p-6 space-y-5">
                        {savedItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-4">
                                <div className="flex items-center space-x-4 flex-1">
                                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                        <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="64px" />
                                    </div>
                                    <div>
                                        <Link href={`/products/${item.product.id}`} className="font-semibold text-gray-900 hover:text-indigo-600">{item.product.name}</Link>
                                        <p className="text-gray-600 text-sm">${item.product.price.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => run(item.id, () => moveToCart(item.id))} disabled={busyId === item.id} title="Move to cart" className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-40">
                                        <ArrowUpToLine className="w-4 h-4" /> Move to cart
                                    </button>
                                    <button onClick={() => run(item.id, () => removeItem(item.id))} disabled={busyId === item.id} title="Remove" className="p-2.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-40">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
