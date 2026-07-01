'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Calendar } from 'lucide-react';

const STATUS_STYLES = {
    delivered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    shipped: 'bg-accent/10 text-accent',
    processing: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    pending: 'bg-muted text-muted-foreground',
    cancelled: 'bg-rose-500/10 text-danger',
};

export default function OrdersPage() {
    const { status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
    }, [status, router]);

    useEffect(() => {
        if (status !== 'authenticated') return;
        api.get('/orders')
            .then((res) => setOrders(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [status]);

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-foreground" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-6 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Order History</h1>
                <p className="mt-2 text-muted-foreground">Track and manage your orders</p>
            </div>

            {orders.length === 0 ? (
                <div className="card py-20 text-center">
                    <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-muted">
                        <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="mb-2 text-xl font-bold text-foreground">No orders yet</h2>
                    <p className="mb-6 text-muted-foreground">Start shopping to see your orders here.</p>
                    <Link href="/products" className="btn btn-primary btn-md">Browse products</Link>
                </div>
            ) : (
                <div className="space-y-5">
                    {orders.map((order) => (
                        <div key={order.id} className="card card-hover p-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="space-y-1.5">
                                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Package className="h-4 w-4" /> Order{' '}
                                        <span className="font-mono text-foreground">#{String(order.id).slice(-8)}</span>
                                    </p>
                                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
                                        {order.status}
                                    </span>
                                    <span className="text-2xl font-bold text-foreground">${order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 border-t pt-4 text-sm text-muted-foreground">
                                <Package className="h-4 w-4" />
                                {order.items.length} {order.items.length === 1 ? 'item' : 'items'} in this order
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
