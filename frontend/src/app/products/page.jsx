'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import gsap from 'gsap';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [sortBy, setSortBy] = useState('Price: Low to High');
    const [searchQuery, setSearchQuery] = useState('');
    const productsRef = useRef(null);
    const heroRef = useRef(null);

    const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Beauty'];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products');
                setProducts(res.data);
                setFilteredProducts(res.data);
            } catch (err) {
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        let filtered = [...products];

        // Filter by category
        if (selectedCategory !== 'All Categories') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'Price: Low to High':
                    return a.price - b.price;
                case 'Price: High to Low':
                    return b.price - a.price;
                case 'Most Popular':
                case 'New In':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        setFilteredProducts(filtered);
    }, [products, selectedCategory, sortBy, searchQuery]);

    // GSAP Animations
    useEffect(() => {
        let ctx = gsap.context(() => {
            // Animate hero section
            gsap.from(heroRef.current, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: 'power3.out'
            });

            // Animate product cards when filtered products change
            if (filteredProducts.length > 0 && productsRef.current) {
                const cards = productsRef.current.querySelectorAll('.product-card');
                gsap.fromTo(cards,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.05,
                        ease: 'power2.out',
                        clearProps: 'all'
                    }
                );
            }
        });

        return () => ctx.revert();
    }, [filteredProducts]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex justify-center items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-lg font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section ref={heroRef} className="bg-white border-b border-gray-200 py-16 px-4">
                <div className="container mx-auto max-w-6xl">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
                        All Products
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
                        Discover our complete collection of quality products. From everyday essentials to special finds, browse everything we have to offer.
                    </p>
                </div>
            </section>

            {/* Filter Bar */}
            <section className="bg-white border-b border-gray-200 py-4 px-4 sticky top-16 z-30 shadow-sm">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="appearance-none bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer whitespace-nowrap"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                                ))}
                            </select>

                            <select
                                className="appearance-none bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer whitespace-nowrap"
                            >
                                <option>All Colors</option>
                                <option>Black</option>
                                <option>White</option>
                                <option>Blue</option>
                            </select>

                            {/* Sort Filter */}
                            <div className="relative ml-auto">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 rounded-full px-6 py-3 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer transition-all"
                                >
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Grid */}
            <section className="py-12 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="mb-6 text-sm text-gray-500 font-medium">
                        Showing <span className="text-gray-900">{filteredProducts.length}</span> of {products.length} products
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('All Categories');
                                }}
                                className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-medium"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <div ref={productsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredProducts.map((product, index) => (
                                <ProductCard key={product._id || product.id || index} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
