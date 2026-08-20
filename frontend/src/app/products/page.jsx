'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import api from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import ProductCardSkeleton from '../../components/ProductCardSkeleton';
import { Search, ChevronLeft, ChevronRight, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { formatPrice } from '../../lib/format';

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
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-[var(--border)] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-card p-2">
                    <ProductCardSkeleton />
                </div>
            ))}
        </div>
    );
}

/**
 * Filter controls, shared between the desktop rail and the mobile sheet.
 *
 * Price filters server-side (the API takes minPrice/maxPrice), so the result
 * count and pagination stay truthful. There is deliberately no rating filter:
 * the API has no rating threshold, and filtering a page client-side after the
 * server has already paginated makes both the "showing X-Y of Z" line and the
 * page buttons lie about what is there.
 */
function Filters({
    categories,
    category,
    onCategory,
    priceDraft,
    setPriceDraft,
    onApplyPrice,
    onClearPrice,
    priceActive,
}) {
    const submit = (e) => {
        e.preventDefault();
        onApplyPrice();
    };

    return (
        <div className="space-y-5">
            <div>
                <div className="mb-2.5 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price</h3>
                    {priceActive && (
                        <button
                            onClick={onClearPrice}
                            className="text-[11px] font-semibold text-[var(--primary)] hover:underline"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <form onSubmit={submit} className="flex items-center gap-1.5">
                    <input
                        inputMode="numeric"
                        aria-label="Minimum price"
                        placeholder="Min"
                        value={priceDraft.min}
                        onChange={(e) =>
                            setPriceDraft((p) => ({ ...p, min: e.target.value.replace(/\D/g, '').slice(0, 7) }))
                        }
                        className="input num w-full px-2 py-1.5 text-[13px]"
                    />
                    <span className="shrink-0 text-xs text-muted-foreground">to</span>
                    <input
                        inputMode="numeric"
                        aria-label="Maximum price"
                        placeholder="Max"
                        value={priceDraft.max}
                        onChange={(e) =>
                            setPriceDraft((p) => ({ ...p, max: e.target.value.replace(/\D/g, '').slice(0, 7) }))
                        }
                        className="input num w-full px-2 py-1.5 text-[13px]"
                    />
                    <button type="submit" className="btn btn-secondary btn-sm shrink-0 px-2.5">
                        Go
                    </button>
                </form>
            </div>

            <div className="border-t pt-5">
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</h3>
                <ul className="no-scrollbar max-h-[19rem] space-y-0.5 overflow-y-auto">
                    <li>
                        <button
                            onClick={() => onCategory('All')}
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
                                onClick={() => onCategory(c)}
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
        </div>
    );
}

function ProductsContent() {
    const sp = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const reduced = useReducedMotion();

    // The URL is the single source of truth. Without this, a search typed into
    // the navbar while already on /products changed the address bar and
    // nothing else, because state was only ever seeded on first mount.
    const search = sp.get('search') || '';
    const category = sp.get('category') || 'All';
    const sort = SORT_OPTIONS.find((o) => o.value === sp.get('sort'))?.value || 'newest';
    const minPrice = sp.get('minPrice') || '';
    const maxPrice = sp.get('maxPrice') || '';
    const page = Math.max(1, Number.parseInt(sp.get('page') || '1', 10) || 1);

    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, hasNext: false });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [sheetOpen, setSheetOpen] = useState(false);

    const [searchInput, setSearchInput] = useState(search);
    const [priceDraft, setPriceDraft] = useState({ min: minPrice, max: maxPrice });

    const setParams = useCallback(
        (patch, { keepPage = false } = {}) => {
            const next = new URLSearchParams(sp.toString());
            for (const [k, v] of Object.entries(patch)) {
                if (v === '' || v == null || v === 'All') next.delete(k);
                else next.set(k, String(v));
            }
            if (!keepPage) next.delete('page');
            const qs = next.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        },
        [sp, pathname, router],
    );

    // Mirror external URL changes (navbar search, back button) into the inputs.
    const [lastUrlSearch, setLastUrlSearch] = useState(search);
    if (search !== lastUrlSearch) {
        setLastUrlSearch(search);
        setSearchInput(search);
    }
    const priceKey = `${minPrice}|${maxPrice}`;
    const [lastPriceKey, setLastPriceKey] = useState(priceKey);
    if (priceKey !== lastPriceKey) {
        setLastPriceKey(priceKey);
        setPriceDraft({ min: minPrice, max: maxPrice });
    }

    useEffect(() => {
        api.get('/products/categories')
            .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
            .catch(() => setCategories([]));
    }, []);

    // Debounce typing into the URL rather than into a second copy of state.
    useEffect(() => {
        const t = setTimeout(() => {
            const term = searchInput.trim();
            if (term !== search) setParams({ search: term });
        }, 400);
        return () => clearTimeout(t);
    }, [searchInput, search, setParams]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), sort });
            if (search) params.set('search', search);
            if (category && category !== 'All') params.set('category', category);
            if (minPrice) params.set('minPrice', minPrice);
            if (maxPrice) params.set('maxPrice', maxPrice);
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
    }, [page, search, category, sort, minPrice, maxPrice]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const from = meta.total === 0 ? 0 : (meta.page - 1) * LIMIT + 1;
    const to = Math.min(meta.page * LIMIT, meta.total);

    const applyPrice = () => {
        let { min, max } = priceDraft;
        // A reversed range returns nothing and looks broken; swap it instead.
        if (min && max && Number(min) > Number(max)) [min, max] = [max, min];
        setParams({ minPrice: min, maxPrice: max });
        setSheetOpen(false);
    };

    const clearPrice = () => {
        setPriceDraft({ min: '', max: '' });
        setParams({ minPrice: '', maxPrice: '' });
    };

    const clearAll = () => {
        setSearchInput('');
        setPriceDraft({ min: '', max: '' });
        router.replace(pathname, { scroll: false });
    };

    const priceActive = Boolean(minPrice || maxPrice);
    const hasFilters = Boolean(search) || category !== 'All' || priceActive;

    const goToPage = (next) => {
        setParams({ page: next > 1 ? next : '' }, { keepPage: true });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filterProps = {
        categories,
        category,
        onCategory: (c) => {
            setParams({ category: c });
            setSheetOpen(false);
        },
        priceDraft,
        setPriceDraft,
        onApplyPrice: applyPrice,
        onClearPrice: clearPrice,
        priceActive,
    };

    const heading = search ? `Results for "${search}"` : category !== 'All' ? category : 'All products';

    const priceLabel =
        minPrice && maxPrice
            ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
            : minPrice
              ? `Over ${formatPrice(minPrice)}`
              : `Under ${formatPrice(maxPrice)}`;

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
                    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-1">
                        <h1 className="text-lg font-bold capitalize tracking-tight">{heading}</h1>
                        {!loading && !error && meta.total > 0 && (
                            <p className="text-[13px] text-muted-foreground">
                                <span className="num font-semibold text-foreground">
                                    {from}-{to}
                                </span>{' '}
                                of <span className="num font-semibold text-foreground">{meta.total}</span>
                            </p>
                        )}
                    </div>

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
                                        onClick={() => setParams({ sort: o.value === 'newest' ? '' : o.value })}
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
                                    <button onClick={() => setParams({ category: '' })} className="chip capitalize">
                                        {category} <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                                {priceActive && (
                                    <button onClick={clearPrice} className="chip">
                                        {priceLabel} <X className="h-3.5 w-3.5" />
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

                    {loading ? (
                        <SkeletonGrid count={10} />
                    ) : error ? (
                        <div className="card p-16 text-center">
                            <p className="font-semibold text-[var(--danger)]">{error}</p>
                            <button onClick={fetchProducts} className="btn btn-primary btn-md mt-4">
                                Retry
                            </button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="card p-16 text-center">
                            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-muted">
                                <Search className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h2 className="mb-1.5 text-lg font-bold">No products found</h2>
                            <p className="mb-5 text-sm text-muted-foreground">
                                {hasFilters
                                    ? 'Nothing matches these filters. Try widening them.'
                                    : 'The catalogue is empty right now.'}
                            </p>
                            {hasFilters && (
                                <button onClick={clearAll} className="btn btn-primary btn-md">
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <motion.div
                                key={`${search}|${category}|${sort}|${minPrice}|${maxPrice}|${page}`}
                                initial={reduced ? false : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-[var(--border)] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                            >
                                {products.map((p) => (
                                    <div key={p.id || p._id} className="bg-card p-2">
                                        <ProductCard product={p} />
                                    </div>
                                ))}
                            </motion.div>

                            {meta.totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => goToPage(meta.page - 1)}
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
                                    Show results
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
