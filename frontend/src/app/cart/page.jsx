'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, Bookmark, ArrowUpToLine, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Reveal from '../../components/motion/Reveal';
const EMPTY_SUMMARY = {
    subtotal: 0,
}; 
export default function CartPage() {
    const { status } = useSession();
    const router = useRouter();
    const { getCart, updateQuantity, removeItem, saveForLater, moveToCart } = useCart();

    const [cart, setCart] = useState({
        items: [],
        savedItems: [],
        summary: EMPTY_SUMMARY,
    });
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [notice, setNotice] = useState(null);

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
            .catch((err) => {
                console.error('Failed to load cart:', err);
                setNotice('Failed to load cart');
            })
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
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-foreground" />
            </div>
        );
    }

    const { items, savedItems, summary } = cart;

    if (items.length === 0 && savedItems.length === 0) {
        return (
            <div className="mx-auto max-w-md px-6 py-20 text-center">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-12">
                    <div className="mb-4 text-6xl">🛒</div>
                    <h1 className="mb-3 text-2xl font-bold text-foreground">Your cart is empty</h1>
                    <p className="mb-6 text-muted-foreground">Start adding some amazing products!</p>
                    <Link href="/products" className="btn btn-primary btn-md">Continue shopping</Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-10">
            <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground md:text-4xl">Shopping Cart</h1>

            <AnimatePresence>
                {notice && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">{notice}</div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="card overflow-hidden">
                        <AnimatePresence initial={false}>
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="flex flex-col gap-4 border-b p-5 last:border-0 sm:flex-row sm:items-center"
                                >
                                    <div className="flex flex-1 items-center gap-4">
                                        <Link href={`/products/${item.product.id}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border bg-muted">
                                            <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="96px" />
                                        </Link>
                                        <div className="min-w-0">
                                            <Link href={`/products/${item.product.id}`} className="block truncate font-semibold text-foreground hover:text-accent">{item.product.name}</Link>
                                            <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)} each</p>
                                            <p className="text-xs text-muted-foreground">{item.product.stock} in stock</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                                        <div className="flex items-center rounded-full border">
                                            <button onClick={() => run(item.id, () => updateQuantity(item.id, item.quantity - 1))} disabled={busyId === item.id} className="grid h-9 w-9 place-items-center rounded-l-full hover:bg-muted disabled:opacity-40" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                                            <span className="w-9 overflow-hidden text-center text-sm font-semibold">
                                                <AnimatePresence mode="popLayout" initial={false}>
                                                    <motion.span key={item.quantity} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.18 }} className="inline-block">{item.quantity}</motion.span>
                                                </AnimatePresence>
                                            </span>
                                            <button onClick={() => run(item.id, () => updateQuantity(item.id, item.quantity + 1))} disabled={busyId === item.id} className="grid h-9 w-9 place-items-center rounded-r-full hover:bg-muted disabled:opacity-40" aria-label="Increase"><Plus className="h-4 w-4" /></button>
                                        </div>
                                        <span className="w-20 text-right font-bold text-foreground">${(item.product.price * item.quantity).toFixed(2)}</span>
                                        <div className="flex">
                                            <motion.button whileTap={{ scale: 0.85 }} onClick={() => run(item.id, () => saveForLater(item.id))} disabled={busyId === item.id} title="Save for later" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-40"><Bookmark className="h-5 w-5" /></motion.button>
                                            <motion.button whileTap={{ scale: 0.85 }} onClick={() => run(item.id, () => removeItem(item.id))} disabled={busyId === item.id} title="Remove" className="grid h-9 w-9 place-items-center rounded-lg text-rose-500 hover:bg-rose-500/10 disabled:opacity-40"><Trash2 className="h-5 w-5" /></motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {items.length === 0 && <p className="p-6 text-center text-muted-foreground">No active items. Check your saved items below.</p>}
                    </div>

                    {savedItems.length > 0 && (
                        <div className="card overflow-hidden">
                            <div className="border-b px-5 py-4"><h2 className="font-bold text-foreground">Saved for later ({savedItems.length})</h2></div>
                            <AnimatePresence initial={false}>
                                {savedItems.map((item) => (
                                    <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }} className="flex items-center justify-between gap-4 border-b p-5 last:border-0">
                                        <div className="flex flex-1 items-center gap-4">
                                            <Link href={`/products/${item.product.id}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted"><Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="64px" /></Link>
                                            <div className="min-w-0"><Link href={`/products/${item.product.id}`} className="block truncate font-medium text-foreground hover:text-accent">{item.product.name}</Link><p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)}</p></div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => run(item.id, () => moveToCart(item.id))} disabled={busyId === item.id} className="btn btn-ghost btn-sm"><ArrowUpToLine className="h-4 w-4" /> Move to cart</motion.button>
                                            <motion.button whileTap={{ scale: 0.85 }} onClick={() => run(item.id, () => removeItem(item.id))} disabled={busyId === item.id} title="Remove" className="grid h-9 w-9 place-items-center rounded-lg text-rose-500 hover:bg-rose-500/10 disabled:opacity-40"><Trash2 className="h-5 w-5" /></motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    {items.length > 0 && (
                        <motion.div layout className="card sticky top-24 p-6">
                            <h2 className="mb-4 text-lg font-bold text-foreground">Order Summary</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-foreground">
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            <motion.span key={summary.subtotal} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }} className="inline-block">${summary.subtotal.toFixed(2)}</motion.span>
                                        </AnimatePresence>
                                    </span>
                                </div>
                                <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="font-medium text-emerald-400">Free</span></div>
                                <div className="flex justify-between border-t pt-3 text-base"><span className="font-semibold text-foreground">Total</span><span className="font-bold text-foreground">${summary.subtotal.toFixed(2)}</span></div>
                            </div>
                            <Link href="/checkout" className="btn btn-accent btn-lg mt-6 w-full">Proceed to Checkout <ArrowRight className="h-4 w-4" /></Link>
                            <Link href="/products" className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground">Continue shopping</Link>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
