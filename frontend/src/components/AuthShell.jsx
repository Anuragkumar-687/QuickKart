'use client';

import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';

export function Field({ label, icon, children }) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">{label}</label>
            <div className="relative">
                {icon && (
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:h-[18px] [&_svg]:w-[18px]">
                        {icon}
                    </span>
                )}
                {children}
            </div>
        </div>
    );
}

function Logo({ className = '' }) {
    return (
        <Link href="/" className={`flex items-center gap-2 ${className}`}>
            <span
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                className="grid h-9 w-9 place-items-center rounded-lg text-lg font-black"
            >
                Q
            </span>
            <span className="text-xl font-extrabold tracking-tight">
                Quick<span style={{ color: 'var(--primary)' }}>Kart</span>
            </span>
        </Link>
    );
}

export default function AuthShell({ title, subtitle, children }) {
    return (
        <div className="grid min-h-screen lg:grid-cols-[440px_1fr]">
            {/* Brand panel — flat colour, no decorative blur. */}
            <div
                className="relative hidden flex-col justify-between p-10 lg:flex"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
                <Link href="/" className="flex items-center gap-2">
                    <span
                        className="grid h-9 w-9 place-items-center rounded-lg text-lg font-black"
                        style={{ backgroundColor: 'var(--primary-foreground)', color: 'var(--primary)' }}
                    >
                        Q
                    </span>
                    <span className="text-xl font-extrabold tracking-tight">QuickKart</span>
                </Link>

                <div>
                    <h2 className="text-3xl font-extrabold leading-tight">
                        Everything you need, in one place.
                    </h2>
                    <ul className="mt-7 space-y-3.5 text-sm font-medium opacity-90">
                        <li className="flex items-center gap-3"><Truck className="h-5 w-5" /> Free delivery on eligible orders</li>
                        <li className="flex items-center gap-3"><RotateCcw className="h-5 w-5" /> Easy returns</li>
                        <li className="flex items-center gap-3"><ShieldCheck className="h-5 w-5" /> Secure checkout</li>
                    </ul>
                </div>

                <p className="text-xs opacity-60">© {new Date().getFullYear()} QuickKart</p>
            </div>

            {/* Form */}
            <div className="flex items-center justify-center bg-surface px-5 py-12">
                <div className="w-full max-w-sm">
                    <Logo className="mb-8 justify-center lg:hidden" />
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
