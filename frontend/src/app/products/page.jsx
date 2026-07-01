'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import ProductCardSkeleton from '../../components/ProductCardSkeleton';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const SORT_OPTIONS = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low → High', value: 'price_asc' },
    { label: 'Price: High → Low', value: 'price_desc' },
    { label: 'Top Rated', value: 'rating_desc' },
    { label: 'A → Z', value: 'name_asc' },
];
const LIMIT = 12;

const gridContainer = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const gridItem = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

function SkeletonGrid({ count = 8 }) {
    return (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

function ProductsContent() {
    const sp = useSearchParams();
    const initialSort = SORT_OPTIONS.find((o) => o.value === sp.get('sort'))?.value || 'newest';

    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, hasNext: false });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [categories, setCategories] = useState([]);
    const [searchInput, setSearchInput] = useState(sp.get('search') || '');
    const [search, setSearch] = useState(sp.get('search') || '');
    const [category, setCategory] = useState(sp.get('category') || 'All');
    const [sort, setSort] = useState(initialSort);
    const [page, setPage] = useState(1);
    const reduced = useReducedMotion();

    useEffect(() => {
        api.get('/products/categories')
            .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
            .catch(() => setCategories([]));
    }, []);

    // Debounce search → server-side query
    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        setPage(1);
    }, [category, sort]);

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
        } catch (err) {
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [page, search, category, sort]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const from = meta.total === 0 ? 0 : (meta.page - 1) * LIMIT + 1;
    const to = Math.min(meta.page * LIMIT, meta.total);
    const clearAll = () => {
        setSearchInput('');
        setCategory('All');
        setSort('newest');
    };

    return (
        <div>
            {/* Header */}
            <section className="border-b bg-background">
                <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">All Products</h1>
                    <p className="mt-3 max-w-2xl text-muted-foreground">
                        Browse the full catalogue — search, filter by category and sort, all powered server-side.
                    </p>
                </div>
            </section>

            {/* Sticky filter bar */}
            <section className="sticky top-[72px] z-30 border-b bg-surface shadow-sm shadow-black/20">
                <div className="mx-auto max-w-7xl px-6 py-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative lg:max-w-sm lg:flex-1">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search products..."
                                className="input rounded-full pl-11"
                            />
                        </div>

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="input w-auto rounded-full py-2.5 text-sm font-medium"
                        >
                            <option value="All">All Categories</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 lg:ml-auto">
                            <SlidersHorizontal className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
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

                    {(search || category !== 'All') && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Active:</span>
                            {search && (
                                <button onClick={() => setSearchInput('')} className="chip">
                                    “{search}” <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                            {category !== 'All' && (
                                <button onClick={() => setCategory('All')} className="chip">
                                    {category} <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Grid */}
            <section className="mx-auto max-w-7xl px-6 py-10">
                {!loading && !error && meta.total > 0 && (
                    <p className="mb-6 text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{from}–{to}</span> of {meta.total}
                    </p>
                )}

                {loading ? (
                    <SkeletonGrid count={8} />
                ) : error ? (
                    <div className="py-20 text-center font-medium text-danger">{error}</div>
                ) : products.length === 0 ? (
                    <div className="rounded-3xl border border-dashed py-20 text-center">
                        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-muted">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-foreground">No products found</h3>
                        <p className="mb-6 text-muted-foreground">Try adjusting your search or filters.</p>
                        <button onClick={clearAll} className="btn btn-primary btn-md">Clear filters</button>
                    </div>
                ) : (
                    <>
                        <motion.div
                            key={`${search}|${category}|${sort}|${page}`}
                            variants={reduced ? undefined : gridContainer}
                            initial={reduced ? undefined : 'hidden'}
                            animate={reduced ? undefined : 'show'}
                            className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
                        >
                            {products.map((p) => (
                                <motion.div key={p.id} variants={reduced ? undefined : gridItem}>
                                    <ProductCard product={p} />
                                </motion.div>
                            ))}
                        </motion.div>

                        <div className="mt-12 flex items-center justify-center gap-3">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={meta.page <= 1}
                                className="btn btn-outline btn-md"
                            >
                                <ChevronLeft className="h-4 w-4" /> Prev
                            </button>
                            <span className="px-2 text-sm text-muted-foreground">
                                Page <span className="font-semibold text-foreground">{meta.page}</span> of {meta.totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!meta.hasNext}
                                className="btn btn-outline btn-md"
                            >
                                Next <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense
            fallback={
                <div className="mx-auto max-w-7xl px-6 py-16">
                    <SkeletonGrid count={8} />
                </div>
            }
        >
            <ProductsContent />
        </Suspense>
    );
}
