'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const SORT_OPTIONS = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Top Rated', value: 'rating_desc' },
    { label: 'Name: A to Z', value: 'name_asc' },
];

const LIMIT = 12;

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, hasNext: false });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [categories, setCategories] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);

    // Load category list once
    useEffect(() => {
        api.get('/products/categories')
            .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
            .catch(() => setCategories([]));
    }, []);

    // Debounce the search box → drives a server-side query
    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    // Reset to page 1 when filters change
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

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="bg-white border-b border-gray-200 py-16 px-4">
                <div className="container mx-auto max-w-6xl">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">All Products</h1>
                    <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
                        Browse our full catalogue — search, filter by category and sort, all powered server-side.
                    </p>
                </div>
            </section>

            {/* Filter Bar */}
            <section className="bg-white border-b border-gray-200 py-4 px-4 sticky top-16 z-30 shadow-sm">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>

                        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="appearance-none bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer whitespace-nowrap"
                            >
                                <option value="All">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2.5 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer whitespace-nowrap"
                            >
                                {SORT_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Grid */}
            <section className="py-12 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="mb-6 text-sm text-gray-500 font-medium">
                        {meta.total > 0 ? (
                            <>Showing <span className="text-gray-900">{from}–{to}</span> of {meta.total} products</>
                        ) : null}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-500 font-medium">{error}</div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500 mb-6">Try adjusting your search or filters.</p>
                            <button
                                onClick={() => { setSearchInput(''); setCategory('All'); setSort('newest'); }}
                                className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-medium"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-center gap-4 mt-12">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={meta.page <= 1}
                                    className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Prev
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page {meta.page} of {meta.totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={!meta.hasNext}
                                    className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
