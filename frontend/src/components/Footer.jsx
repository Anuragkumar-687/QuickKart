'use client';

import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

const COLUMNS = [
    { title: 'Shop', links: [['All products', '/products'], ['Top rated', '/products?sort=rating_desc'], ['New arrivals', '/products?sort=newest'], ['Wishlist', '/wishlist']] },
    { title: 'Account', links: [['Sign in', '/login'], ['Create account', '/register'], ['My orders', '/orders'], ['Cart', '/cart']] },
    { title: 'Help', links: [['Track order', '/orders'], ['Shipping', '/'], ['Returns', '/'], ['Contact us', '/']] },
];

// Service promises, stated plainly. No invented statistics.
const PROMISES = [
    { icon: Truck, title: 'Free delivery', text: 'On eligible orders' },
    { icon: RotateCcw, title: 'Easy returns', text: 'Straightforward process' },
    { icon: ShieldCheck, title: 'Secure checkout', text: 'Protected payments' },
    { icon: Headphones, title: 'Support', text: 'We answer questions' },
];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="mt-12 border-t bg-background">
            <div className="border-b">
                <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-6 px-6 py-8 lg:grid-cols-4">
                    {PROMISES.map((p) => (
                        <div key={p.title} className="flex items-center gap-3">
                            <span
                                style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
                                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
                            >
                                <p.icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">{p.title}</p>
                                <p className="truncate text-xs text-muted-foreground">{p.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mx-auto max-w-[1400px] px-6 py-10">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <Link href="/" className="mb-3 flex items-center gap-2">
                            <span
                                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                                className="grid h-8 w-8 place-items-center rounded-lg text-base font-black"
                            >
                                Q
                            </span>
                            <span className="text-lg font-extrabold tracking-tight">
                                Quick<span style={{ color: 'var(--primary)' }}>Kart</span>
                            </span>
                        </Link>
                        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                            Electronics, fashion, home and more — with trending picks tuned to your region.
                        </p>
                    </div>

                    {COLUMNS.map((col) => (
                        <div key={col.title}>
                            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {col.title}
                            </h4>
                            <ul className="space-y-2.5">
                                {col.links.map(([label, href]) => (
                                    <li key={label}>
                                        <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
                    <p>© {year} QuickKart</p>
                    <p>Prices and availability are subject to change.</p>
                </div>
            </div>
        </footer>
    );
}
