'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

const COLUMNS = [
    { title: 'Shop', links: [['All Products', '/products'], ['Wishlist', '/wishlist'], ['Cart', '/cart']] },
    { title: 'Account', links: [['Sign in', '/login'], ['Create account', '/register'], ['Orders', '/orders']] },
    { title: 'Company', links: [['About', '/'], ['Careers', '/'], ['Contact', '/']] },
];

export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="mt-24 border-t bg-background">
            <div className="mx-auto max-w-7xl px-6 py-14">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <Link href="/" className="mb-4 flex items-center gap-2">
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                                <ShoppingBag className="h-4 w-4" />
                            </span>
                            <span className="text-lg font-bold tracking-tight">QuickKart</span>
                        </Link>
                        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                            Region-aware commerce with personalized recommendations, trending products
                            and a fast, modern checkout.
                        </p>
                    </div>
                    {COLUMNS.map((col) => (
                        <div key={col.title}>
                            <h4 className="mb-4 text-sm font-semibold text-foreground">{col.title}</h4>
                            <ul className="space-y-3">
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
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
                    <p>© {year} QuickKart. All rights reserved.</p>
                    <p>Crafted for a premium shopping experience.</p>
                </div>
            </div>
        </footer>
    );
}
