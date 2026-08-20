'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Check, Truck, Home, X, Clock } from 'lucide-react';
import { formatPrice, formatCount } from '../../lib/format';

// Ordered pipeline used to render the progress track.
const FLOW = ['pending', 'processing', 'shipped', 'delivered'];

const STEP_META = {
    pending: { label: 'Order placed', Icon: Clock },
    processing: { label: 'Processing', Icon: Package },
    shipped: { label: 'Shipped', Icon: Truck },
    delivered: { label: 'Delivered', Icon: Home },
};

function StatusTrack({ status }) {
    if (status === 'cancelled') {
        return (
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
                 style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                <X className="h-4 w-4" /> Order cancelled
            </div>
        );
    }

    const current = Math.max(0, FLOW.indexOf(status));

    return (
        <ol className="flex items-center">
            {FLOW.map((step, i) => {
                const { label, Icon } = STEP_META[step];
                const done = i <= current;
                return (
                    <li key={step} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center gap-1.5">
                            <span
                                className="grid h-8 w-8 place-items-center rounded-full border-2 transition-colors"
                                style={{
                                    borderColor: done ? 'var(--savings)' : 'var(--border-strong)',
                                    backgroundColor: done ? 'var(--savings)' : 'transparent',
                                    color: done ? 'var(--savings-foreground)' : 'var(--muted-foreground)',
                                }}
                            >
                                {i < current ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                            </span>
                            <span
                                className="whitespace-nowrap text-[10px] font-semibold"
                                style={{ color: done ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                            >
                                {label}
                            </span>
                        </div>
                        {i < FLOW.length - 1 && (
                            <span
                                className="mx-1 mb-5 h-0.5 flex-1 rounded"
                                style={{ backgroundColor: i < current ? 'var(--savings)' : 'var(--border-strong)' }}
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

export default function OrdersPage() {
    const { status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
    }, [status, router]);

    useEffect(() => {
        if (status !== 'authenticated') return;
        api.get('/orders')
            .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
            .catch(() => setError('Could not load your orders. Please try again.'))
            .finally(() => setLoading(false));
    }, [status]);

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center" role="status">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-[var(--primary)]" />
                <span className="sr-only">Loading orders</span>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
            <h1 className="mb-3 px-1 text-lg font-bold tracking-tight">My orders</h1>

            {error ? (
                <div className="card p-12 text-center">
                    <p className="font-semibold text-[var(--danger)]">{error}</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="card p-16 text-center">
                    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-muted">
                        <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h2 className="mb-1.5 text-lg font-bold">No orders yet</h2>
                    <p className="mb-5 text-sm text-muted-foreground">Your orders will appear here once you place one.</p>
                    <Link href="/products" className="btn btn-primary btn-md">Browse products</Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <div key={order.id} className="card overflow-hidden">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3 sm:px-5">
                                <div className="text-xs">
                                    <p className="text-muted-foreground">
                                        Order <span className="font-mono font-semibold text-foreground">#{String(order.id).slice(-8)}</span>
                                    </p>
                                    <p className="mt-0.5 text-muted-foreground">
                                        Placed on{' '}
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] text-muted-foreground">Total</p>
                                    <p className="price text-lg">{formatPrice(order.totalAmount)}</p>
                                </div>
                            </div>

                            <div className="px-4 py-5 sm:px-6">
                                <StatusTrack status={order.status} />
                            </div>

                            <div className="border-t px-4 py-3 sm:px-5">
                                <p className="mb-2.5 text-xs font-semibold text-muted-foreground">
                                    {formatCount(order.items.length)}{' '}
                                    {order.items.length === 1 ? 'item' : 'items'} in this order
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {order.items.map((item) =>
                                        item.product ? (
                                            <Link
                                                key={item.id}
                                                href={`/products/${item.product.id}`}
                                                title={item.product.name}
                                                className="plate relative h-14 w-14 overflow-hidden rounded-lg border transition hover:opacity-80"
                                            >
                                                <Image
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    fill
                                                    sizes="56px"
                                                    className="object-contain p-1"
                                                />
                                                {item.quantity > 1 && (
                                                    <span
                                                        className="num absolute bottom-0 right-0 rounded-tl px-1 text-[10px] font-bold"
                                                        style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                                                    >
                                                        x{item.quantity}
                                                    </span>
                                                )}
                                            </Link>
                                        ) : null,
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
