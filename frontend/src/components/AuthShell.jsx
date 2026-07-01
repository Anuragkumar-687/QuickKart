'use client';

import Link from 'next/link';
import { ShoppingBag, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

export function Field({ label, icon, children }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
            <div className="relative">
                {icon && (
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:h-5 [&_svg]:w-5">
                        {icon}
                    </span>
                )}
                {children}
            </div>
        </div>
    );
}

export default function AuthShell({ title, subtitle, children }) {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            {/* Brand panel */}
            <div className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:block">
                <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-accent/30 blur-[120px]" />
                <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/20 blur-[120px]" />
                <div className="relative flex h-full flex-col justify-between p-12">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-foreground text-primary">
                            <ShoppingBag className="h-5 w-5" />
                        </span>
                        <span className="text-xl font-bold">QuickKart</span>
                    </Link>
                    <div>
                        <h2 className="text-4xl font-bold leading-tight">
                            A premium shopping experience, personalized to you.
                        </h2>
                        <ul className="mt-8 space-y-4 text-primary-foreground/80">
                            <li className="flex items-center gap-3"><TrendingUp className="h-5 w-5" /> Trending products near you</li>
                            <li className="flex items-center gap-3"><Sparkles className="h-5 w-5" /> Recommendations from your taste</li>
                            <li className="flex items-center gap-3"><ShieldCheck className="h-5 w-5" /> Secure, effortless checkout</li>
                        </ul>
                    </div>
                    <p className="text-sm text-primary-foreground/50">© {new Date().getFullYear()} QuickKart</p>
                </div>
            </div>

            {/* Form */}
            <div className="flex items-center justify-center bg-surface px-6 py-12">
                <div className="w-full max-w-md">
                    <Link href="/" className="mb-8 flex items-center justify-center gap-2 lg:hidden">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                            <ShoppingBag className="h-5 w-5" />
                        </span>
                        <span className="text-xl font-bold">QuickKart</span>
                    </Link>
                    <div className="mb-8 text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                        <p className="mt-2 text-muted-foreground">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
