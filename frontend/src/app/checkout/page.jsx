'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, Banknote, ShieldCheck, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const STEPS = ['Shipping', 'Payment', 'Review'];
const PAYMENTS = [
    { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, hint: 'Visa, Mastercard, Amex' },
    { id: 'upi', label: 'UPI', icon: Smartphone, hint: 'GPay, PhonePe, Paytm' },
    { id: 'cod', label: 'Cash on Delivery', icon: Banknote, hint: 'Pay when it arrives' },
];

const slide = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

function Stepper({ step }) {
    return (
        <div className="mb-8 flex items-center">
            {STEPS.map((label, i) => (
                <div key={label} className="flex flex-1 items-center last:flex-none">
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-semibold transition-colors ${i <= step ? 'border-accent bg-accent text-accent-foreground' : 'text-muted-foreground'}`}>
                        {i < step ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={`ml-2 hidden text-sm font-medium sm:block ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                    {i < STEPS.length - 1 && (
                        <div className="relative mx-3 h-px flex-1 overflow-hidden bg-border">
                            <motion.div className="absolute inset-0 origin-left bg-accent" initial={{ scaleX: 0 }} animate={{ scaleX: i < step ? 1 : 0 }} transition={{ duration: 0.4 }} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function SuccessScreen({ orderId }) {
    return (
        <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="mb-6 grid h-24 w-24 place-items-center rounded-full bg-emerald-500/15">
                <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                    <motion.path d="M20 6 9 17l-5-5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }} />
                </svg>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="text-3xl font-bold tracking-tight">Order confirmed!</motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-3 text-muted-foreground">
                Thank you for your purchase{orderId ? ` — order #${String(orderId).slice(-8)}` : ''}. A confirmation is on its way.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-8 flex gap-3">
                <Link href="/orders" className="btn btn-primary btn-lg">View orders</Link>
                <Link href="/products" className="btn btn-outline btn-lg">Continue shopping</Link>
            </motion.div>
        </div>
    );
}

export default function CheckoutPage() {
    const { status } = useSession();
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [shipping, setShipping] = useState({ name: '', address: '', city: '', pincode: '' });
    const [payment, setPayment] = useState('card');

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
    }, [status, router]);

    useEffect(() => {
        if (status !== 'authenticated') return;
        api.get('/cart')
            .then((res) => setCartItems(res.data.items || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [status]);

    const total = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
    const back = () => setStep((s) => Math.max(0, s - 1));

    const handlePlaceOrder = async () => {
        if (processing) return;
        setProcessing(true);
        try {
            const res = await api.post('/orders'); // unchanged backend call
            setOrderId(res.data?.id || '');
            setSuccess(true);
        } catch (error) {
            alert('Failed to place order');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-foreground" />
            </div>
        );
    }
    if (success) return <SuccessScreen orderId={orderId} />;
    if (cartItems.length === 0) {
        return (
            <div className="mx-auto max-w-md px-6 py-20 text-center">
                <div className="card p-12">
                    <h1 className="mb-3 text-2xl font-bold">Your cart is empty</h1>
                    <p className="mb-6 text-muted-foreground">Add items before checking out.</p>
                    <Link href="/products" className="btn btn-primary btn-md">Browse products</Link>
                </div>
            </div>
        );
    }

    const inputBase = 'mb-2 block text-sm font-medium text-foreground';

    return (
        <div className="mx-auto max-w-4xl px-6 py-10">
            <h1 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">Checkout</h1>
            <Stepper step={step} />

            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                <div className="card p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div key="ship" {...slide}>
                                <h2 className="mb-5 text-lg font-bold">Shipping details</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className={inputBase}>Full name</label>
                                        <input value={shipping.name} onChange={(e) => setShipping((p) => ({ ...p, name: e.target.value }))} placeholder="Alex Smith" className="input" />
                                    </div>
                                    <div>
                                        <label className={inputBase}>Address</label>
                                        <input value={shipping.address} onChange={(e) => setShipping((p) => ({ ...p, address: e.target.value }))} placeholder="123 Premium Street" className="input" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={inputBase}>City</label>
                                            <input value={shipping.city} onChange={(e) => setShipping((p) => ({ ...p, city: e.target.value }))} placeholder="Mumbai" className="input" />
                                        </div>
                                        <div>
                                            <label className={inputBase}>Pincode</label>
                                            <input value={shipping.pincode} onChange={(e) => setShipping((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, '').slice(0, 6),}))} placeholder="400001"className="input"/>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div key="pay" {...slide}>
                                <h2 className="mb-5 text-lg font-bold">Payment method</h2>
                                <div className="space-y-3">
                                    {PAYMENTS.map((p) => {
                                        const active = payment === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => setPayment(p.id)}
                                                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${active ? 'border-accent bg-accent/5' : 'hover:border-foreground/20'}`}
                                            >
                                                <span className={`grid h-10 w-10 place-items-center rounded-xl ${active ? 'bg-accent text-accent-foreground' : 'bg-muted text-foreground'}`}>
                                                    <p.icon className="h-5 w-5" />
                                                </span>
                                                <span className="flex-1">
                                                    <span className="block font-medium text-foreground">{p.label}</span>
                                                    <span className="block text-xs text-muted-foreground">{p.hint}</span>
                                                </span>
                                                <span className={`grid h-5 w-5 place-items-center rounded-full border ${active ? 'border-accent bg-accent text-accent-foreground' : ''}`}>
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
                                <h2 className="mb-5 text-lg font-bold">Review your order</h2>
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
                                                <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="56px" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-foreground">{item.product.name}</p>
                                                <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                                            </div>
                                            <span className="font-semibold text-foreground">${(item.product.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-5 rounded-xl border bg-background/40 p-4 text-sm text-muted-foreground">
                                    Paying with <span className="font-medium text-foreground">{PAYMENTS.find((p) => p.id === payment)?.label}</span>
                                    {shipping.city ? <> · Shipping to <span className="font-medium text-foreground">{shipping.city}</span></> : null}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 flex items-center justify-between">
                        <button onClick={back} disabled={step === 0} className="btn btn-ghost btn-md disabled:opacity-40">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </button>
                        {step < STEPS.length - 1 ? (
                            <button onClick={next} className="btn btn-primary btn-md">Continue <ArrowRight className="h-4 w-4" /></button>
                        ) : (
                            <button onClick={handlePlaceOrder} disabled={processing} className="btn btn-accent btn-lg">
                                {processing ? 'Placing order…' : 'Place Order'} <ArrowRight className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <div>
                    <div className="card sticky top-24 p-6">
                        <h2 className="mb-4 text-lg font-bold">Order Summary</h2>
                        <div className="max-h-48 space-y-3 overflow-y-auto pr-1">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex justify-between gap-2 text-sm">
                                    <span className="line-clamp-1 text-muted-foreground">{item.product.name} × {item.quantity}</span>
                                    <span className="shrink-0 font-medium text-foreground">${(item.product.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                            <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="text-emerald-400">Free</span></div>
                            <div className="flex justify-between text-base font-bold text-foreground"><span>Total</span><span>${total.toFixed(2)}</span></div>
                        </div>
                        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <ShieldCheck className="h-4 w-4" /> Secure, encrypted checkout
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
