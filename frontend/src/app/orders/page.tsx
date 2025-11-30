'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Package, Calendar, DollarSign } from 'lucide-react';

interface OrderItem {
    product: string;
    quantity: number;
    price: number;
}

interface Order {
    _id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

export default function OrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders');
                setOrders(res.data);
            } catch (error) {
                console.error('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchOrders();
        }
    }, [status]);

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-gray-900">Order History</h1>
                <p className="text-gray-600">Track and manage your orders</p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                    <div className="text-6xl mb-4">📦</div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">No Orders Yet</h2>
                    <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="group bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:border-blue-200">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-gray-600 group-hover:text-blue-600 transition-colors duration-300">
                                        <Package className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                                        <p className="text-sm font-semibold">Order ID: <span className="text-gray-900">{order._id}</span></p>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-600 group-hover:text-blue-600 transition-colors duration-300">
                                        <Calendar className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                                        <p className="text-sm font-semibold">
                                            Date: <span className="text-gray-900">{new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="flex items-center space-x-2 group-hover:scale-105 transition-transform duration-300">
                                        <DollarSign className="w-5 h-5 text-blue-600" />
                                        <p className="font-bold text-3xl text-gray-900">${order.totalAmount.toFixed(2)}</p>
                                    </div>
                                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-md transition-all duration-300 transform group-hover:scale-105 ${order.status === 'delivered' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' :
                                        order.status === 'shipped' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700' :
                                            'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                            <div className="border-t-2 border-gray-100 pt-4 group-hover:border-blue-100 transition-colors duration-300">
                                <div className="flex items-center space-x-2">
                                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors duration-300">
                                        <Package className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <p className="text-gray-700 font-semibold">
                                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'} in this order
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
