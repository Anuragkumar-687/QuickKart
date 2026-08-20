'use client';

import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    ShoppingCart, Menu, X, LogOut, Heart, Search, MapPin,
    ChevronDown, Package, LayoutDashboard, CornerDownLeft,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { formatPrice } from '../lib/format';
import ThemeToggle from './ThemeToggle';

function CountBadge({ n }) {
    return (
        <motion.span
            key={n}
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 14 }}
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            className="absolute -right-1.5 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-bold tabular-nums"
        >
            {n > 99 ? '99+' : n}
        </motion.span>
    );
}

function IconLink({ href, label, count, children, targetAttr }) {
    return (
        <Link
            href={href}
            aria-label={count > 0 ? `${label} (${count} items)` : label}
            className="relative grid h-10 w-10 place-items-center rounded-lg text-foreground transition-colors hover:bg-muted"
            {...(targetAttr ? { 'data-cart-target': '' } : {})}
        >
            {children}
            {count > 0 && <CountBadge n={count} />}
        </Link>
    );
}

/** Debounced product suggestions under the search field. */
function useSuggestions(query) {
    const term = query.trim();
    const enabled = term.length >= 2;
    // Results are tagged with the term that produced them, so a stale response
    // is discarded by derivation rather than by clearing state in an effect.
    const [result, setResult] = useState({ term: '', items: [] });

    useEffect(() => {
        if (!enabled) return;
        let cancelled = false;
        const t = setTimeout(() => {
            api.get(`/products?search=${encodeURIComponent(term)}&limit=6`)
                .then((r) => {
                    if (!cancelled) setResult({ term, items: r.data?.data || [] });
                })
                .catch(() => {
                    if (!cancelled) setResult({ term, items: [] });
                });
        }, 250);
        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [term, enabled]);

    const fresh = enabled && result.term === term;
    return { items: fresh ? result.items : [], loading: enabled && !fresh };
}

function SearchField({ onNavigate, autoFocus = false }) {
    const [q, setQ] = useState('');
    const [open, setOpen] = useState(false);
    const [activeRaw, setActive] = useState(-1);
    const boxRef = useRef(null);
    const router = useRouter();
    const { items, loading } = useSuggestions(q);
    // Derived so a shrinking result list can never leave a dangling highlight.
    const active = activeRaw < items.length ? activeRaw : -1;

    useEffect(() => {
        const onDocClick = (e) => {
            if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    const go = (href) => {
        setOpen(false);
        setQ('');
        onNavigate?.();
        router.push(href);
    };

    const submit = (e) => {
        e.preventDefault();
        const term = q.trim();
        go(term ? `/products?search=${encodeURIComponent(term)}` : '/products');
    };

    const onKeyDown = (e) => {
        if (!open || items.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => (i + 1) % items.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
        } else if (e.key === 'Enter' && active >= 0) {
            e.preventDefault();
            const p = items[active];
            go(`/products/${p.id || p._id}`);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    return (
        <div ref={boxRef} className="relative w-full">
            <form onSubmit={submit} role="search">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={q}
                        autoFocus={autoFocus}
                        onChange={(e) => {
                            setQ(e.target.value);
                            setOpen(true);
                        }}
                        onFocus={() => setOpen(true)}
                        onKeyDown={onKeyDown}
                        placeholder="Search for products, brands and more"
                        aria-label="Search products"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-controls="nav-search-results"
                        aria-expanded={open && items.length > 0}
                        className="h-11 w-full rounded-lg border bg-card pl-11 pr-24 text-sm text-foreground placeholder:text-muted-foreground transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <button
                        type="submit"
                        className="btn btn-primary absolute right-1.5 top-1/2 h-8 -translate-y-1/2 px-3.5 text-[13px]"
                    >
                        Search
                    </button>
                </div>
            </form>

            <AnimatePresence>
                {open && q.trim().length >= 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border bg-card shadow-2xl shadow-black/30"
                    >
                        {loading && items.length === 0 ? (
                            <div className="space-y-2 p-3">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="skeleton h-10 w-10 rounded" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="skeleton h-3 w-2/3 rounded" />
                                            <div className="skeleton h-3 w-1/4 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : items.length === 0 ? (
                            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                                No matches for “{q.trim()}”
                            </p>
                        ) : (
                            <ul id="nav-search-results" role="listbox">
                                {items.map((p, i) => {
                                    const id = p.id || p._id;
                                    return (
                                        <li key={id}>
                                            <button
                                                type="button"
                                                onMouseEnter={() => setActive(i)}
                                                onClick={() => go(`/products/${id}`)}
                                                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                                                    active === i ? 'bg-muted' : 'hover:bg-muted'
                                                }`}
                                            >
                                                <span className="plate relative h-10 w-10 shrink-0 overflow-hidden rounded">
                                                    <Image src={p.image} alt="" fill sizes="40px" className="object-contain p-1" />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm text-foreground">{p.name}</span>
                                                    <span className="block truncate text-xs text-muted-foreground">{p.category}</span>
                                                </span>
                                                <span className="price shrink-0 text-sm">{formatPrice(p.price)}</span>
                                            </button>
                                        </li>
                                    );
                                })}
                                <li>
                                    <button
                                        type="button"
                                        onClick={submit}
                                        className="flex w-full items-center justify-center gap-2 border-t px-4 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted"
                                    >
                                        See all results for “{q.trim()}” <CornerDownLeft className="h-3.5 w-3.5" />
                                    </button>
                                </li>
                            </ul>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function AccountMenu({ session }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onDocClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    if (!session) {
        return (
            <div className="hidden items-center gap-2 md:flex">
                <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
                <Link href="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </div>
        );
    }

    return (
        <div ref={ref} className="relative hidden md:block">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-muted"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <span
                    style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
                    className="grid h-7 w-7 place-items-center rounded-full text-xs font-bold uppercase"
                >
                    {session.user?.name?.charAt(0) || 'U'}
                </span>
                <span className="max-w-[6rem] truncate">{session.user?.name}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 overflow-hidden rounded-xl border bg-card p-1.5 shadow-2xl shadow-black/30"
                        role="menu"
                    >
                        <div className="border-b px-3 pb-2 pt-1.5">
                            <p className="truncate text-sm font-semibold">{session.user?.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{session.user?.email}</p>
                        </div>
                        <Link href="/orders" onClick={() => setOpen(false)} className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted">
                            <Package className="h-4 w-4 text-muted-foreground" /> My orders
                        </Link>
                        <Link href="/wishlist" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted">
                            <Heart className="h-4 w-4 text-muted-foreground" /> Wishlist
                        </Link>
                        {session.user?.role === 'admin' && (
                            <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted">
                                <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Admin
                            </Link>
                        )}
                        <button
                            onClick={() => { setOpen(false); signOut(); }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                        >
                            <LogOut className="h-4 w-4 text-muted-foreground" /> Sign out
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function Navbar() {
    const { data: session } = useSession();
    const { cartCount } = useCart();
    const { count: wishlistCount } = useWishlist();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 4);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Route changed: collapse the menu during render rather than after paint.
    const [lastPath, setLastPath] = useState(pathname);
    if (pathname !== lastPath) {
        setLastPath(pathname);
        setIsMenuOpen(false);
    }

    const region = session?.user?.region;
    const city = session?.user?.city;
    const deliverTo = city || (region ? `${region} India` : null);

    return (
        <header
            style={{ backgroundColor: 'var(--header)' }}
            className={`sticky top-0 z-50 border-b transition-shadow duration-200 ${
                scrolled ? 'shadow-lg shadow-black/20' : ''
            }`}
        >
            {/* Utility row — the thin strip real marketplaces use for context. */}
            <div className="hidden border-b lg:block">
                <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-between px-6 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {deliverTo ? (
                            <span>Deliver to <span className="font-semibold text-foreground">{deliverTo}</span></span>
                        ) : (
                            <Link href="/login" className="hover:text-foreground">Sign in to set your delivery region</Link>
                        )}
                    </div>
                    <nav className="flex items-center gap-5">
                        <Link href="/products" className="transition-colors hover:text-foreground">All products</Link>
                        <Link href="/orders" className="transition-colors hover:text-foreground">Track order</Link>
                        {session?.user?.role === 'admin' && (
                            <Link href="/admin" className="transition-colors hover:text-foreground">Admin</Link>
                        )}
                    </nav>
                </div>
            </div>

            {/* Main row */}
            <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
                <Link href="/" className="flex shrink-0 items-center gap-2">
                    <span
                        style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                        className="grid h-9 w-9 place-items-center rounded-lg text-lg font-black"
                    >
                        Q
                    </span>
                    <span className="hidden text-[19px] font-extrabold tracking-tight sm:block">
                        Quick<span style={{ color: 'var(--primary)' }}>Kart</span>
                    </span>
                </Link>

                <div className="mx-auto hidden w-full max-w-2xl md:block">
                    <SearchField />
                </div>

                <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
                    <ThemeToggle />
                    {session && (
                        <IconLink href="/wishlist" label="Wishlist" count={wishlistCount}>
                            <Heart className="h-[21px] w-[21px]" />
                        </IconLink>
                    )}
                    <IconLink href="/cart" label="Cart" count={cartCount} targetAttr>
                        <ShoppingCart className="h-[21px] w-[21px]" />
                    </IconLink>
                    <AccountMenu session={session} />

                    <button
                        className="grid h-10 w-10 place-items-center rounded-lg text-foreground hover:bg-muted md:hidden"
                        onClick={() => setIsMenuOpen((o) => !o)}
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile search always visible — it's the primary action. */}
            <div className="border-t px-4 py-2.5 md:hidden">
                <SearchField onNavigate={() => setIsMenuOpen(false)} />
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t md:hidden"
                    >
                        <div className="space-y-1 p-3">
                            {deliverTo && (
                                <p className="flex items-center gap-1.5 px-3 pb-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" /> Deliver to{' '}
                                    <span className="font-semibold text-foreground">{deliverTo}</span>
                                </p>
                            )}
                            <Link href="/products" className="block rounded-lg px-3 py-2.5 font-medium hover:bg-muted">All products</Link>
                            {session && <Link href="/orders" className="block rounded-lg px-3 py-2.5 font-medium hover:bg-muted">My orders</Link>}
                            {session && <Link href="/wishlist" className="block rounded-lg px-3 py-2.5 font-medium hover:bg-muted">Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}</Link>}
                            <Link href="/cart" className="block rounded-lg px-3 py-2.5 font-medium hover:bg-muted">Cart{cartCount > 0 ? ` (${cartCount})` : ''}</Link>
                            {session?.user?.role === 'admin' && <Link href="/admin" className="block rounded-lg px-3 py-2.5 font-medium hover:bg-muted">Admin dashboard</Link>}
                            {session ? (
                                <button onClick={() => signOut()} className="btn btn-secondary btn-md mt-1 w-full">
                                    <LogOut className="h-4 w-4" /> Sign out
                                </button>
                            ) : (
                                <div className="flex gap-2 pt-1">
                                    <Link href="/login" className="btn btn-secondary btn-md flex-1">Sign in</Link>
                                    <Link href="/register" className="btn btn-primary btn-md flex-1">Sign up</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
