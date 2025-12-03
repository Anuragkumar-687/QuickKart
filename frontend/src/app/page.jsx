'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import gsap from 'gsap';

export default function Home() {
    const { data: session } = useSession();

    // Always keep arrays as arrays
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [category, setCategory] = useState('All Categories');
    const [sortBy, setSortBy] = useState('Price: Low to High');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const heroRef = useRef(null);
    const productsRef = useRef(null);

    // Fetch products safely
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get(`/products?page=${page}&limit=12`);
                const data = res.data;

                console.log("API Response: ", data);

                let products = [];

                // Correct API response shape
                if (data && Array.isArray(data.products)) {
                    products = data.products;
                    setTotalPages(
                        typeof data.totalPages === 'number'
                            ? data.totalPages
                            : 1
                    );
                }
                // Fallback for older response format
                else if (Array.isArray(data)) {
                    products = data;
                    setTotalPages(1);
                }
                else {
                    console.error("Unexpected products response:", data);
                }

                setFeaturedProducts(products);
            } catch (error) {
                console.error('Failed to fetch products:', error);
                setFeaturedProducts([]); // prevent undefined map
            }
        };

        fetchProducts();
    }, [page]);

    // GSAP animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(heroRef.current, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: 'power3.out'
            });

            if (featuredProducts.length > 0 && productsRef.current) {
                const cards = productsRef.current.querySelectorAll('.product-card');
                gsap.from(cards, {
                    opacity: 0,
                    y: 50,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power2.out',
                    delay: 0.3,
                    clearProps: 'all'
                });
            }
        });

        return () => ctx.revert();
    }, [featuredProducts]);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section
                ref={heroRef}
                className="bg-white border-b border-gray-200 py-16 px-4"
            >
                <div className="container mx-auto max-w-6xl">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
                        Get Inspired
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
                        Browsing for your next long-haul trip, everyday journey,
                        or just fancy a look at what's new?
                    </p>
                </div>
            </section>

            {/* Filters Section */}
            <section className="bg-white border-b border-gray-200 py-6 px-4 sticky top-16 z-40">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-wrap gap-4">
                        {/* Category Filter */}
                        <div className="relative">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-full px-6 py-3 pr-10 text-sm font-medium text-gray-700"
                            >
                                <option>All Categories</option>
                                <option>Electronics</option>
                                <option>Clothing</option>
                                <option>Home & Garden</option>
                                <option>Sports</option>
                            </select>
                        </div>

                        {/* Sort Filter */}
                        <div className="relative ml-auto">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-full px-6 py-3 pr-10 text-sm font-medium text-gray-700"
                            >
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-12 px-4">
                <div className="container mx-auto max-w-6xl">
                    {featuredProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900 mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">
                                Loading products...
                            </p>
                        </div>
                    ) : (
                        <div
                            ref={productsRef}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {Array.isArray(featuredProducts) &&
                                featuredProducts.map((product, index) => (
                                    <ProductCard
                                        key={
                                            product._id ||
                                            product.id ||
                                            index
                                        }
                                        product={product}
                                    />
                                ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-12 gap-4">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className={`px-6 py-2 rounded-full border ${page === 1
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                                }`}
                        >
                            Previous
                        </button>

                        <span className="text-gray-600 font-medium">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            onClick={() =>
                                setPage((p) =>
                                    Math.min(totalPages, p + 1)
                                )
                            }
                            disabled={page === totalPages}
                            className={`px-6 py-2 rounded-full border ${page === totalPages
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
