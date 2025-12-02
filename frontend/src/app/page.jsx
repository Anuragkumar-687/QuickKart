'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import gsap from 'gsap';

export default function Home() {
    const { data: session } = useSession();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [category, setCategory] = useState('All Categories');
    const [sortBy, setSortBy] = useState('Price: Low to High');
    const heroRef = useRef(null);
    const productsRef = useRef(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products');
                setFeaturedProducts(res.data);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            }
        };

        fetchProducts();
    }, []);

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

            // Animate product cards when they load
            if (featuredProducts.length > 0 && productsRef.current) {
                const cards = productsRef.current.querySelectorAll('.product-card');
                gsap.from(cards, {
                    opacity: 0,
                    y: 50,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power2.out',
                    delay: 0.3,
                    clearProps: 'all' // Ensure props are cleared after animation to prevent conflicts
                });
            }
        });

        return () => ctx.revert(); // Cleanup
    }, [featuredProducts]);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section ref={heroRef} className="bg-white border-b border-gray-200 py-16 px-4">
                <div className="container mx-auto max-w-6xl">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
                        Get Inspired
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
                        Browsing for your next long-haul trip, everyday journey, or just fancy a look at what's new? From community favourites to about-to-sell-out items, see them all here.
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
                                className="appearance-none bg-white border border-gray-300 rounded-full px-6 py-3 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer transition-all"
                            >
                                <option>All Categories</option>
                                <option>Electronics</option>
                                <option>Clothing</option>
                                <option>Home & Garden</option>
                                <option>Sports</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Color Filter */}
                        <div className="relative">
                            <select className="appearance-none bg-white border border-gray-300 rounded-full px-6 py-3 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer transition-all">
                                <option>All Colors</option>
                                <option>Black</option>
                                <option>White</option>
                                <option>Gray</option>
                                <option>Blue</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Features Filter */}
                        <div className="relative">
                            <select className="appearance-none bg-white border border-gray-300 rounded-full px-6 py-3 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer transition-all">
                                <option>All Features</option>
                                <option>Featured</option>
                                <option>On Sale</option>
                                <option>New Arrival</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div className="relative">
                            <select className="appearance-none bg-white border border-gray-300 rounded-full px-6 py-3 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer transition-all">
                                <option>All Prices</option>
                                <option>Under $50</option>
                                <option>$50 - $100</option>
                                <option>$100 - $200</option>
                                <option>Over $200</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

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
            </section>

            {/* Products Grid */}
            <section className="py-12 px-4">
                <div className="container mx-auto max-w-6xl">
                    {featuredProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900 mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">Loading products...</p>
                        </div>
                    ) : (
                        <div ref={productsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product, index) => (
                                <ProductCard key={product._id || product.id || index} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
