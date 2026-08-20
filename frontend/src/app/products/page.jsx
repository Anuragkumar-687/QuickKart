'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import ProductCardSkeleton from '../../components/ProductCardSkeleton';
import { Search, ChevronLeft, ChevronRight, X, SlidersHorizontal, Star } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const SORT_OPTIONS = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: low to high', value: 'price_asc' },
    { label: 'Price: high to low', value: 'price_desc' },
    { label: 'Customer rating', value: 'rating_desc' },
    { label: 'Name A-Z', value: 'name_asc' },
];
const LIMIT = 20;

function SkeletonGrid({ count = 10 }) {
    return (
        <div className="grid grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-card p-2">
                    <ProductCardSkeleton />
                </div>
            ))}
        </div>
    );
}

/** Filter controls, shared between the desktop rail and the mobile sheet. */
function Filters({ categories, category, setCategory, minRating, setMinRating }) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</h3>
                <ul className="space-y-0.5">
                    <li>
                        <button
                            onClick={() => setCategory('All')}
                            className={`w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                                category === 'All'
                                    ? 'bg-[var(--primary-soft)] font-semibold text-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            All categories
                        </button>
                    </li>
                    {categories.map((c) => (
                        <li key={c}>
                            <button
                                onClick={() => setCategory(c)}
                                className={`w-full truncate rounded-lg px-2.5 py-1.5 text-left text-[13px] capitalize transition-colors ${
                                    category === c
                                        ? 'bg-[var(--primary-soft)] font-semibold text-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                {c}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Customer rating
                </h3>
                <div className="space-y-0.5">
                    {[4, 3, 2].map((r) => (
                        <button
                            key={r}
                            onClick={() => setMinRating(minRating === r ? 0 : r)}
                            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
                                minRating === r
                                    ? 'bg-[var(--primary-soft)] font-semibold text-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <span className="rating-chip">
                                <span className="num">{r}</span>
                                <Star className="h-2.5 w-2.5 fill-current" />
                            </span>
                            &amp; above
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ProductsContent() {
    const sp = useSearchParams();
    const initialSort = SORT_OPTIONS.find((o) => o.value === sp.get('sort'))?.value || 'newest';
    const reduced = useReducedMotion();

    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, hasNext: false });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [categories, setCategories] = useState([]);
    const [searchInput, setSearchInput] = useState(sp.get('search') || '');
    const [search, setSearch] = useState(sp.get('search') || '');
    const [category, setCategory] = useState(sp.get('category') || 'All');
    const [sort, setSort] = useState(initialSort);
    const [minRating, setMinRating] = useState(0);
    const [page, setPage] = useState(1);
    const [sheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        api.get('/products/categories')
            .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    // Changing a filter resets to page 1. Done during render so the fetch below
    // never fires once for the old page and again for the new one.
    const filterKey = `${category}|${sort}`;
    const [lastFilterKey, setLastFilterKey] = useState(filterKey);
    if (filterKey !== lastFilterKey) {
        setLastFilterKey(filterKey);
        setPage(1);
    }

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), sort });
            if (search) params.set('search', search);
            if (category && category !== 'All') params.set('category', category);
            const res = await api.get(`/products?${params.toString()}`);
            setProducts(res.data.data || []);
            setMeta({
                total: res.data.total,
                page: res.data.page,
                totalPages: res.data.totalPages,
                hasNext: res.data.hasNext,
            });
        } catch {
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [page, search, category, sort]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Rating is filtered client-side; the API has no rating threshold param, so
    // the count line below states plainly that it applies to this page only.
    const visible = minRating > 0 ? products.filter((p) => (p.rating || 0) >= minRating) : products;

    const from = meta.total === 0 ? 0 : (meta.page - 1) * LIMIT + 1;
    const to = Math.min(meta.page * LIMIT, meta.total);

    const clearAll = () => {
        setSearchInput('');
        setCategory('All');
        setSort('newest');
        setMinRating(0);
    };

    const hasFilters = search || category !== 'All' || minRating > 0;
    const filterProps = { categories, category, setCategory, minRating, setMinRating };

    const goToPage = (next) => {
        setPage(next);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
            <div className="flex gap-5">
                {/* Desktop filter rail */}
                <aside className="hidden w-56 shrink-0 lg:block">
                    <div className="card sticky top-[124px] max-h-[calc(100vh-140px)] overflow-y-auto p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-bold">Filters</h2>
                            {hasFilters && (
                                <button
                                    onClick={clearAll}
                                    className="text-xs font-semibold text-[var(--primary)] hover:underline"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                        <Filters {...filterProps} />
                    </div>
                </aside>

                <div className="min-w-0 flex-1">
                    {/* Toolbar */}
                    <div className="card mb-3 p-3">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                            <div className="relative lg:max-w-xs lg:flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search within products"
                                    aria-label="Search within products"
                                    className="input pl-9"
                                />
                            </div>

                            <button onClick={() => setSheetOpen(true)} className="btn btn-secondary btn-sm lg:hidden">
                                <SlidersHorizontal className="h-4 w-4" /> Filters
                                {hasFilters && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />}
                            </button>

                            <div className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 lg:ml-auto">
                                <span className="hidden shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:block">
                                    Sort
                                </span>
                                {SORT_OPTIONS.map((o) => (
                                    <button
                                        key={o.value}
                                        onClick={() => setSort(o.value)}
                                        className={`chip ${sort === o.value ? 'chip-active' : ''}`}
                                    >
                                        {o.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {hasFilters && (
                            <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3 text-sm">
                                {search && (
                                    <button onClick={() => setSearchInput('')} className="chip">
                                        &ldquo;{search}&rdquo; <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                                {category !== 'All' && (
                                    <button onClick={() => setCategory('All')} className="chip capitalize">
                                        {category} <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                                {minRating > 0 && (
                                    <button onClick={() => setMinRating(0)} className="chip">
                                        {minRating} star &amp; above <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                                <button
                                    onClick={clearAll}
                                    className="text-xs font-semibold text-[var(--primary)] hover:underline"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    {!loading && !error && meta.total > 0 && (
                        <p className="mb-3 px-1 text-[13px] text-muted-foreground">
                            Showing{' '}
                            <span className="num font-semibold text-foreground">
                                {from}-{to}
                            </span>{' '}
                            of <span className="num font-semibold text-foreground">{meta.total}</span> products
                            {minRating > 0 && visible.length !== products.length && (
                                <span>
                                    {' '}
                                    &middot; {visible.length} on this page rated {minRating} star and above
                                </span>
                            )}
                        </p>
                    )}

                    {loading ? (
                        <SkeletonGrid count={10} />
                    ) : error ? (
                        <div className="card p-16 text-center">
                            <p className="font-semibold text-[var(--danger)]">{error}</p>
                            <button onClick={fetchProducts} className="btn btn-primary btn-md mt-4">
                                Retry
                            </button>
                        </div>
                    ) : visible.length === 0 ? (
                        <div className="card p-16 text-center">
                            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-muted">
                                <Search className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="mb-1.5 text-lg font-bold">No products found</h3>
                            <p className="mb-5 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                            <button onClick={clearAll} className="btn btn-primary btn-md">
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <motion.div
                                key={`${search}|${category}|${sort}|${page}`}
                                initial={reduced ? false : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-[var(--border)] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                            >
                                {visible.map((p) => (
                                    <div key={p.id || p._id} className="bg-card p-2">
                                        <ProductCard product={p} />
                                    </div>
                                ))}
                            </motion.div>

                            {meta.totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => goToPage(Math.max(1, meta.page - 1))}
                                        disabled={meta.page <= 1}
                                        className="btn btn-secondary btn-sm"
                                    >
                                        <ChevronLeft className="h-4 w-4" /> Prev
                                    </button>
                                    <span className="num px-2 text-[13px] text-muted-foreground">
                                        Page <span className="font-bold text-foreground">{meta.page}</span> of{' '}
                                        {meta.totalPages}
                                    </span>
                                    <button
                                        onClick={() => goToPage(meta.page + 1)}
                                        disabled={!meta.hasNext}
                                        className="btn btn-secondary btn-sm"
                                    >
                                        Next <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Mobile filter sheet */}
            <AnimatePresence>
                {sheetOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSheetOpen(false)}
                            className="fixed inset-0 z-50 bg-black/60 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-xs overflow-y-auto bg-card p-5 lg:hidden"
                            role="dialog"
                            aria-label="Filters"
                        >
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="text-base font-bold">Filters</h2>
                                <button
                                    onClick={() => setSheetOpen(false)}
                                    aria-label="Close filters"
                                    className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <Filters {...filterProps} />
                            <div className="mt-6 flex gap-2">
                                <button onClick={clearAll} className="btn btn-secondary btn-md flex-1">
                                    Clear
                                </button>
                                <button onClick={() => setSheetOpen(false)} className="btn btn-primary btn-md flex-1">
                                    Apply
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense
            fallback={
                <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
                    <SkeletonGrid count={10} />
                </div>
            }
        >
            <ProductsContent />
        </Suspense>
    );
}
