'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, Bookmark, ArrowUpToLine, ArrowRight, ShoppingCart, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice, formatCount } from '../../lib/format';

const EMPTY_SUMMARY = { subtotal: 0 };

export default function CartPage() {
    const { status } = useSession();
    const router = useRouter();
    const { getCart, updateQuantity, removeItem, saveForLater, moveToCart } = useCart();

    const [cart, setCart] = useState({ items: [], savedItems: [], summary: EMPTY_SUMMARY });
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [notice, setNotice] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
    }, [status, router]);

    const normalize = (data) => ({
        items: data?.items || [],
        savedItems: data?.savedItems || [],
        summary: data?.summary || EMPTY_SUMMARY,
    });

    useEffect(() => {
        if (status !== 'authenticated') return;
        getCart()
            .then((d) => setCart(normalize(d)))
            .catch(() => setNotice('Failed to load your cart'))
            .finally(() => setLoading(false));
    }, [status, getCart]);

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
            <div className="flex min-h-[40vh] items-center justify-center" role="status">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-[var(--primary)]" />
                <span className="sr-only">Loading cart</span>
            </div>
        );
    }

    const { items, savedItems, summary } = cart;
    const totalUnits = items.reduce((n, i) => n + i.quantity, 0);

    if (items.length === 0 && savedItems.length === 0) {
        return (
            <div className="mx-auto max-w-md px-6 py-20 text-center">
                <div className="card p-12">
                    <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-muted">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h1 className="mb-2 text-xl font-bold">Your cart is empty</h1>
                    <p className="mb-6 text-sm text-muted-foreground">
                        Browse the catalogue and add something you like.
                    </p>
                    <Link href="/products" className="btn btn-primary btn-md">Continue shopping</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
            <AnimatePresence>
                {notice && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3 overflow-hidden"
                        role="alert"
                    >
                        <div
                            className="rounded-lg border px-4 py-2.5 text-sm font-medium"
                            style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                        >
                            {notice}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                <div className="min-w-0 space-y-4">
                    <div className="card overflow-hidden">
                        <div className="flex items-baseline justify-between border-b px-4 py-3.5 sm:px-5">
                            <h1 className="text-lg font-bold tracking-tight">My cart</h1>
                            <span className="num text-sm text-muted-foreground">
                                {formatCount(totalUnits)} item{totalUnits === 1 ? '' : 's'}
                            </span>
                        </div>

                        <AnimatePresence initial={false}>
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -32, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.25, ease: [0.25, 0.8, 0.3, 1] }}
                                    className="flex gap-4 border-b p-4 last:border-0 sm:p-5"
                                >
                                    <Link
                                        href={`/products/${item.product.id}`}
                                        className="plate relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border"
                                    >
                                        <Image
                                            src={item.product.image}
                                            alt={item.product.name}
                                            fill
                                            sizes="96px"
                                            className="object-contain p-2"
                                        />
                                    </Link>

                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <Link
                                            href={`/products/${item.product.id}`}
                                            className="line-clamp-2 text-sm font-semibold text-foreground hover:text-[var(--primary)]"
                                        >
                                            {item.product.name}
                                        </Link>
                                        <p className="num mt-0.5 text-xs text-muted-foreground">
                                            {formatPrice(item.product.price)} each
                                        </p>
                                        {item.product.stock <= 5 && (
                                            <p className="mt-0.5 text-xs font-semibold text-[var(--danger)]">
                                                Only {item.product.stock} left
                                            </p>
                                        )}

                                        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                                            <div className="flex items-center rounded-lg border">
                                                <button
                                                    onClick={() => run(item.id, () => updateQuantity(item.id, item.quantity - 1))}
                                                    disabled={busyId === item.id || item.quantity <= 1}
                                                    className="grid h-8 w-8 place-items-center rounded-l-lg hover:bg-muted disabled:opacity-40"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="num w-9 overflow-hidden text-center text-sm font-bold">
                                                    <AnimatePresence mode="popLayout" initial={false}>
                                                        <motion.span
                                                            key={item.quantity}
                                                            initial={{ y: 10, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            exit={{ y: -10, opacity: 0 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="inline-block"
                                                        >
                                                            {item.quantity}
                                                        </motion.span>
                                                    </AnimatePresence>
                                                </span>
                                                <button
                                                    onClick={() => run(item.id, () => updateQuantity(item.id, item.quantity + 1))}
                                                    disabled={busyId === item.id || item.quantity >= item.product.stock}
                                                    className="grid h-8 w-8 place-items-center rounded-r-lg hover:bg-muted disabled:opacity-40"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => run(item.id, () => saveForLater(item.id))}
                                                disabled={busyId === item.id}
                                                className="btn btn-ghost btn-sm text-muted-foreground"
                                            >
                                                <Bookmark className="h-4 w-4" /> Save for later
                                            </button>
                                            <button
                                                onClick={() => run(item.id, () => removeItem(item.id))}
                                                disabled={busyId === item.id}
                                                className="btn btn-ghost btn-sm text-[var(--danger)]"
                                            >
                                                <Trash2 className="h-4 w-4" /> Remove
                                            </button>
                                        </div>
                                    </div>

                                    <span className="price shrink-0 text-base">
                                        {formatPrice(item.product.price * item.quantity)}
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {items.length === 0 && (
                            <p className="p-6 text-center text-sm text-muted-foreground">
                                No active items — check your saved items below.
                            </p>
                        )}
                    </div>

                    {savedItems.length > 0 && (
                        <div className="card overflow-hidden">
                            <div className="border-b px-4 py-3.5 sm:px-5">
                                <h2 className="text-sm font-bold">
                                    Saved for later ({formatCount(savedItems.length)})
                                </h2>
                            </div>
                            <AnimatePresence initial={false}>
                                {savedItems.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: -32, transition: { duration: 0.2 } }}
                                        className="flex items-center gap-4 border-b p-4 last:border-0"
                                    >
                                        <Link
                                            href={`/products/${item.product.id}`}
                                            className="plate relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border"
                                        >
                                            <Image
                                                src={item.product.image}
                                                alt={item.product.name}
                                                fill
                                                sizes="64px"
                                                className="object-contain p-1.5"
                                            />
                                        </Link>
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/products/${item.product.id}`}
                                                className="line-clamp-1 text-sm font-medium text-foreground hover:text-[var(--primary)]"
                                            >
                                                {item.product.name}
                                            </Link>
                                            <p className="price mt-0.5 text-sm">{formatPrice(item.product.price)}</p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                            <button
                                                onClick={() => run(item.id, () => moveToCart(item.id))}
                                                disabled={busyId === item.id}
                                                className="btn btn-secondary btn-sm"
                                            >
                                                <ArrowUpToLine className="h-4 w-4" /> Move to cart
                                            </button>
                                            <button
                                                onClick={() => run(item.id, () => removeItem(item.id))}
                                                disabled={busyId === item.id}
                                                aria-label="Remove saved item"
                                                className="grid h-9 w-9 place-items-center rounded-lg text-[var(--danger)] hover:bg-muted disabled:opacity-40"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Price details — the itemised panel Indian marketplaces use. */}
                {items.length > 0 && (
                    <aside>
                        <div className="card sticky top-[124px] overflow-hidden">
                            <h2 className="border-b px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Price details
                            </h2>
                            <div className="space-y-3 p-5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Price ({formatCount(totalUnits)} item{totalUnits === 1 ? '' : 's'})
                                    </span>
                                    <span className="num font-medium">
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            <motion.span
                                                key={summary.subtotal}
                                                initial={{ y: 8, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -8, opacity: 0 }}
                                                transition={{ duration: 0.18 }}
                                                className="inline-block"
                                            >
                                                {formatPrice(summary.subtotal)}
                                            </motion.span>
                                        </AnimatePresence>
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Delivery charges</span>
                                    <span className="font-bold text-[var(--savings)]">Free</span>
                                </div>
                                <div className="flex justify-between border-t border-dashed pt-3 text-base">
                                    <span className="font-bold">Total amount</span>
                                    <span className="price">{formatPrice(summary.subtotal)}</span>
                                </div>
                            </div>

                            <div className="border-t p-4">
                                <Link href="/checkout" className="btn btn-primary btn-lg w-full">
                                    Place order <ArrowRight className="h-4 w-4" />
                                </Link>
                                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                                    <ShieldCheck className="h-3.5 w-3.5 text-[var(--savings)]" />
                                    Safe and secure checkout
                                </p>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
