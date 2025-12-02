'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

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

    const total = cartItems.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0
    );

    const handlePlaceOrder = async () => {
        setProcessing(true);
        try {
            await api.post('/orders');
            alert('Order placed successfully!');
            router.push('/orders');
        } catch (error) {
            alert('Failed to place order');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (cartItems.length === 0) {
        return <div className="p-8 text-center">Your cart is empty</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl  font-bold mb-8 text-center">Checkout</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-black">Order Summary</h2>
                    <div className="space-y-4">
                        {cartItems.map((item, index) => (
                            <div key={item._id || item.id || index} className="flex text-black justify-between">
                                <span>
                                    {item.product.name} x {item.quantity}
                                </span>
                                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="border-t pt-4 text-black flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handlePlaceOrder}
                disabled={processing}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 font-semibold text-lg"
            >
                {processing ? 'Processing...' : 'Place Order'}
            </button>
        </div>
    );
}
