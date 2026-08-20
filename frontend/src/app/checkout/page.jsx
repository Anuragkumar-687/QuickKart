'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, Smartphone, Banknote, ShieldCheck, ArrowRight, ArrowLeft, Check, Loader2,
} from 'lucide-react';
import { formatPrice, formatCount } from '../../lib/format';
import { useCart } from '../../context/CartContext';

const STEPS = ['Address', 'Payment', 'Review'];
const PAYMENTS = [
    { id: 'card', label: 'Credit / debit card', icon: CreditCard, hint: 'Visa, Mastercard, RuPay' },
    { id: 'upi', label: 'UPI', icon: Smartphone, hint: 'GPay, PhonePe, Paytm' },
    { id: 'cod', label: 'Cash on delivery', icon: Banknote, hint: 'Pay when it arrives' },
];

const slide = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.25, ease: [0.25, 0.8, 0.3, 1] },
};

function Stepper({ step }) {
    return (
        <ol className="mb-4 flex items-center px-1">
            {STEPS.map((label, i) => {
                const done = i <= step;
                return (
                    <li key={label} className="flex flex-1 items-center last:flex-none">
                        <span
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold transition-colors"
                            style={{
                                borderColor: done ? 'var(--primary)' : 'var(--border-strong)',
                                backgroundColor: done ? 'var(--primary)' : 'transparent',
                                color: done ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                            }}
                        >
                            {i < step ? <Check className="h-4 w-4" /> : i + 1}
                        </span>
                        <span
                            className="ml-2 hidden text-xs font-semibold sm:block"
                            style={{ color: done ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                        >
                            {label}
                        </span>
                        {i < STEPS.length - 1 && (
                            <span className="relative mx-3 h-0.5 flex-1 overflow-hidden rounded bg-[var(--border-strong)]">
                                <motion.span
                                    className="absolute inset-0 origin-left"
                                    style={{ backgroundColor: 'var(--primary)' }}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: i < step ? 1 : 0 }}
                                    transition={{ duration: 0.35 }}
                                />
                            </span>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

function SuccessScreen({ orderId }) {
    return (
        <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="mb-6 grid h-20 w-20 place-items-center rounded-full"
                style={{ backgroundColor: 'color-mix(in oklab, var(--savings) 18%, transparent)' }}
            >
                <svg
                    width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                    style={{ color: 'var(--savings)' }}
                >
                    <motion.path
                        d="M20 6 9 17l-5-5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
                    />
                </svg>
            </motion.div>
            <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold tracking-tight"
            >
                Order placed
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-2 text-sm text-muted-foreground"
            >
                {orderId ? (
                    <>Your order <span className="font-mono font-semibold text-foreground">#{String(orderId).slice(-8)}</span> has been recorded.</>
                ) : (
                    'Your order has been recorded.'
                )}
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-7 flex gap-3"
            >
                <Link href="/orders" className="btn btn-primary btn-md">View orders</Link>
                <Link href="/products" className="btn btn-secondary btn-md">Continue shopping</Link>
            </motion.div>
        </div>
    );
}

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { fetchCartCount } = useCart();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [error, setError] = useState('');
    const [shipping, setShipping] = useState({ name: '', address: '', city: '', pincode: '' });
    const [payment, setPayment] = useState('card');

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
    }, [status, router]);

    useEffect(() => {
        if (status !== 'authenticated') return;
        api.get('/cart')
            .then((res) => setCartItems(res.data.items || []))
            .catch(() => setError('Could not load your cart.'))
            .finally(() => setLoading(false));
    }, [status]);

    // Prefill from the profile so the address step isn't busywork. Applied
    // during render, once per signed-in user, leaving later edits untouched.
    const [prefilledFor, setPrefilledFor] = useState(null);
    if (session?.user && prefilledFor !== session.user.email) {
        setPrefilledFor(session.user.email);
        setShipping((p) => ({
            ...p,
            name: p.name || session.user.name || '',
            city: p.city || session.user.city || '',
            pincode: p.pincode || session.user.pincode || '',
        }));
    }

    const total = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const units = cartItems.reduce((n, i) => n + i.quantity, 0);

    const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
    const back = () => setStep((s) => Math.max(0, s - 1));

    const addressComplete =
        shipping.name.trim() && shipping.address.trim() && shipping.city.trim() && shipping.pincode.length === 6;

    const handlePlaceOrder = async () => {
        if (processing) return;
        setProcessing(true);
        setError('');
        try {
            const res = await api.post('/orders');
            setOrderId(res.data?.id || '');
            // The order emptied the cart server-side; resync the navbar badge.
            fetchCartCount();
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center" role="status">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-[var(--primary)]" />
                <span className="sr-only">Loading checkout</span>
            </div>
        );
    }

    if (success) return <SuccessScreen orderId={orderId} />;

    if (cartItems.length === 0) {
        return (
            <div className="mx-auto max-w-md px-6 py-20 text-center">
                <div className="card p-12">
                    <h1 className="mb-2 text-xl font-bold">Your cart is empty</h1>
                    <p className="mb-6 text-sm text-muted-foreground">Add items before checking out.</p>
                    <Link href="/products" className="btn btn-primary btn-md">Browse products</Link>
                </div>
            </div>
        );
    }

    const labelCls = 'mb-1.5 block text-xs font-semibold text-foreground';

    return (
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
            <h1 className="mb-3 px-1 text-lg font-bold tracking-tight">Checkout</h1>

            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                <div className="card p-4 sm:p-6">
                    <Stepper step={step} />

                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div key="ship" {...slide}>
                                <h2 className="mb-4 text-sm font-bold">Delivery address</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="ck-name" className={labelCls}>Full name</label>
                                        <input
                                            id="ck-name"
                                            value={shipping.name}
                                            onChange={(e) => setShipping((p) => ({ ...p, name: e.target.value }))}
                                            placeholder="Full name"
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="ck-addr" className={labelCls}>Address</label>
                                        <input
                                            id="ck-addr"
                                            value={shipping.address}
                                            onChange={(e) => setShipping((p) => ({ ...p, address: e.target.value }))}
                                            placeholder="Flat, building, street"
                                            className="input"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="ck-city" className={labelCls}>City</label>
                                            <input
                                                id="ck-city"
                                                value={shipping.city}
                                                onChange={(e) => setShipping((p) => ({ ...p, city: e.target.value }))}
                                                placeholder="City"
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="ck-pin" className={labelCls}>Pincode</label>
                                            <input
                                                id="ck-pin"
                                                inputMode="numeric"
                                                value={shipping.pincode}
                                                onChange={(e) =>
                                                    setShipping((p) => ({
                                                        ...p,
                                                        pincode: e.target.value.replace(/\D/g, '').slice(0, 6),
                                                    }))
                                                }
                                                placeholder="6-digit pincode"
                                                className="input num"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div key="pay" {...slide}>
                                <h2 className="mb-4 text-sm font-bold">Payment method</h2>
                                <div className="space-y-2.5">
                                    {PAYMENTS.map((p) => {
                                        const active = payment === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => setPayment(p.id)}
                                                className="flex w-full items-center gap-3.5 rounded-lg border p-3.5 text-left transition-colors"
                                                style={{
                                                    borderColor: active ? 'var(--primary)' : 'var(--border)',
                                                    backgroundColor: active ? 'var(--primary-soft)' : 'transparent',
                                                }}
                                            >
                                                <span
                                                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                                                    style={{
                                                        backgroundColor: active ? 'var(--primary)' : 'var(--muted)',
                                                        color: active ? 'var(--primary-foreground)' : 'var(--foreground)',
                                                    }}
                                                >
                                                    <p.icon className="h-4 w-4" />
                                                </span>
                                                <span className="flex-1">
                                                    <span className="block text-sm font-semibold text-foreground">{p.label}</span>
                                                    <span className="block text-xs text-muted-foreground">{p.hint}</span>
                                                </span>
                                                <span
                                                    className="grid h-5 w-5 shrink-0 place-items-center rounded-full border"
                                                    style={{
                                                        borderColor: active ? 'var(--primary)' : 'var(--border-strong)',
                                                        backgroundColor: active ? 'var(--primary)' : 'transparent',
                                                        color: 'var(--primary-foreground)',
                                                    }}
                                                >
                                                    {active && <Check className="h-3 w-3" />}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="rev" {...slide}>
                                <h2 className="mb-4 text-sm font-bold">Review your order</h2>
                                <div className="space-y-3">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <div className="plate relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border">
                                                <Image
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    fill
                                                    sizes="56px"
                                                    className="object-contain p-1.5"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="line-clamp-1 text-sm font-medium text-foreground">
                                                    {item.product.name}
                                                </p>
                                                <p className="num text-xs text-muted-foreground">Qty {item.quantity}</p>
                                            </div>
                                            <span className="price shrink-0 text-sm">
                                                {formatPrice(item.product.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <dl className="mt-4 space-y-1.5 rounded-lg border p-3.5 text-xs">
                                    <div className="flex justify-between gap-3">
                                        <dt className="text-muted-foreground">Paying with</dt>
                                        <dd className="font-semibold text-foreground">
                                            {PAYMENTS.find((p) => p.id === payment)?.label}
                                        </dd>
                                    </div>
                                    {shipping.name && (
                                        <div className="flex justify-between gap-3">
                                            <dt className="text-muted-foreground">Deliver to</dt>
                                            <dd className="truncate text-right font-semibold text-foreground">
                                                {shipping.name}
                                                {shipping.city ? `, ${shipping.city}` : ''}
                                                {shipping.pincode ? ` - ${shipping.pincode}` : ''}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <p role="alert" className="mt-4 text-sm font-semibold text-[var(--danger)]">
                            {error}
                        </p>
                    )}

                    <div className="mt-6 flex items-center justify-between border-t pt-5">
                        <button onClick={back} disabled={step === 0} className="btn btn-ghost btn-md disabled:opacity-40">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </button>
                        {step < STEPS.length - 1 ? (
                            <button
                                onClick={next}
                                disabled={step === 0 && !addressComplete}
                                className="btn btn-primary btn-md"
                            >
                                Continue <ArrowRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button onClick={handlePlaceOrder} disabled={processing} className="btn btn-primary btn-lg">
                                {processing ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Placing order</>
                                ) : (
                                    <>Place order <ArrowRight className="h-4 w-4" /></>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Price details */}
                <aside>
                    <div className="card sticky top-[124px] overflow-hidden">
                        <h2 className="border-b px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Price details
                        </h2>
                        <div className="space-y-3 p-5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Price ({formatCount(units)} item{units === 1 ? '' : 's'})
                                </span>
                                <span className="num font-medium">{formatPrice(total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Delivery charges</span>
                                <span className="font-bold text-[var(--savings)]">Free</span>
                            </div>
                            <div className="flex justify-between border-t border-dashed pt-3 text-base">
                                <span className="font-bold">Total amount</span>
                                <span className="price">{formatPrice(total)}</span>
                            </div>
                        </div>
                        <p className="flex items-center justify-center gap-1.5 border-t px-4 py-3 text-xs text-muted-foreground">
                            <ShieldCheck className="h-3.5 w-3.5 text-[var(--savings)]" /> Safe and secure checkout
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
