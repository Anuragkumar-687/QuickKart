'use client';

import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, Menu, X, User, LogOut, Heart, Search, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import Magnetic from './motion/Magnetic';

function CountBadge({ n }) {
    return (
        <motion.span
            key={n}
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 14 }}
            className="absolute -right-1 -top-1 grid h-4 min-w-[1rem] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground"
        >
            {n}
        </motion.span>
    );
}

function IconLink({ href, label, count, children }) {
    return (
        <Link href={href} aria-label={label} className="relative grid h-9 w-9 place-items-center rounded-full text-foreground transition-colors hover:bg-muted">
            {children}
            {count > 0 && <CountBadge n={count} />}
        </Link>
    );
}

export default function Navbar() {
    const { data: session } = useSession();
    const { cartCount } = useCart();
    const { count: wishlistCount } = useWishlist();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [q, setQ] = useState('');
    const router = useRouter();
    const pathname = usePathname();

    // The products page has its own live search toolbar — avoid a duplicate.
    const showSearch = pathname !== '/products';

    const submitSearch = (e) => {
        e.preventDefault();
        const term = q.trim();
        router.push(term ? `/products?search=${encodeURIComponent(term)}` : '/products');
        setIsMenuOpen(false);
    };

    return (
        <motion.header
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-0 z-50"
        >
            <div className="mx-auto mt-3 max-w-7xl px-4">
                <nav className="glass flex h-14 items-center justify-between gap-3 rounded-2xl border px-3 shadow-xl shadow-black/10 sm:px-4">
                    <Link href="/" className="flex shrink-0 items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
                            <ShoppingBag className="h-5 w-5" />
                        </span>
                        <span className="text-lg font-bold tracking-tight">QuickKart</span>
                    </Link>

                    {showSearch ? (
                        <form onSubmit={submitSearch} className="hidden max-w-md flex-1 md:block">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full rounded-full border bg-card/60 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent/40"
                                />
                            </div>
                        </form>
                    ) : (
                        <div className="hidden flex-1 md:block" />
                    )}

                    <div className="flex items-center gap-0.5 sm:gap-1">
                        <Link href="/products" className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:block">
                            Products
                        </Link>
                        {session?.user?.role === 'admin' && (
                            <Link href="/admin" className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:block">
                                Admin
                            </Link>
                        )}

                        <ThemeToggle />
                        {session && <IconLink href="/wishlist" label="Wishlist" count={wishlistCount}><Heart className="h-5 w-5" /></IconLink>}
                        <IconLink href="/cart" label="Cart" count={cartCount}><ShoppingCart className="h-5 w-5" /></IconLink>

                        {session ? (
                            <div className="hidden items-center gap-2 pl-1 md:flex">
                                <Link href="/orders" className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Orders</Link>
                                <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm font-medium">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="max-w-[7rem] truncate">{session.user?.name}</span>
                                </div>
                                <button onClick={() => signOut()} aria-label="Logout" className="grid h-9 w-9 place-items-center rounded-full text-foreground transition-colors hover:bg-muted">
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="hidden items-center gap-2 pl-1 md:flex">
                                <Link href="/login" className="btn btn-ghost btn-sm">Login</Link>
                                <Magnetic>
                                    <Link href="/register" className="btn btn-accent btn-sm">Register</Link>
                                </Magnetic>
                            </div>
                        )}

                        <button className="grid h-9 w-9 place-items-center rounded-full text-foreground hover:bg-muted md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </nav>

                {/* Mobile dropdown */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="glass mt-2 rounded-2xl border p-3 shadow-xl md:hidden"
                        >
                            <form onSubmit={submitSearch} className="mb-2">
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." className="w-full rounded-full border bg-card/60 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40" />
                                </div>
                            </form>
                            <div className="space-y-1">
                                <Link href="/products" onClick={() => setIsMenuOpen(false)} className="block rounded-lg px-3 py-2.5 font-medium hover:bg-muted">Products</Link>
                                {session?.user?.role === 'admin' && <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="block rounded-lg px-3 py-2.5 font-medium hover:bg-muted">Admin Dashboard</Link>}
                                {session && <Link href="/wishlist" onClick={() => setIsMenuOpen(false)} className="block rounded-lg px-3 py-2.5 font-medium hover:bg-muted">Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}</Link>}
                                <Link href="/cart" onClick={() => setIsMenuOpen(false)} className="block rounded-lg px-3 py-2.5 font-medium hover:bg-muted">Cart{cartCount > 0 ? ` (${cartCount})` : ''}</Link>
                                {session ? (
                                    <>
                                        <Link href="/orders" onClick={() => setIsMenuOpen(false)} className="block rounded-lg px-3 py-2.5 font-medium hover:bg-muted">My Orders</Link>
                                        <button onClick={() => { signOut(); setIsMenuOpen(false); }} className="btn btn-secondary btn-md mt-1 w-full"><LogOut className="h-4 w-4" /> Logout</button>
                                    </>
                                ) : (
                                    <div className="flex gap-2 pt-1">
                                        <Link href="/login" onClick={() => setIsMenuOpen(false)} className="btn btn-outline btn-md flex-1">Login</Link>
                                        <Link href="/register" onClick={() => setIsMenuOpen(false)} className="btn btn-accent btn-md flex-1">Register</Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
}
