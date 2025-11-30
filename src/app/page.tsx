'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '@/components/ProductCard';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        // Just take the first 4 as featured
        setFeaturedProducts(res.data.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch products');
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white rounded-3xl p-12 md:p-16 text-center shadow-2xl">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Welcome to <span className="text-yellow-300">QuickKart</span>
        </h1>
        <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed opacity-95">
          Your one-stop shop for everything you need. Quality products, fast shipping, and excellent customer service.
        </p>

        {session ? (
          <div className="space-y-6">
            <p className="text-3xl font-semibold">Welcome back, <span className="text-yellow-300">{session.user?.name}</span>!</p>
            <Link
              href="/products"
              className="inline-block bg-white text-blue-700 px-10 py-4 rounded-full font-bold hover:bg-yellow-300 hover:text-blue-900 transition-all shadow-lg hover:shadow-2xl text-lg transform hover:scale-105"
            >
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="inline-block bg-white text-blue-700 px-10 py-4 rounded-full font-bold hover:bg-yellow-300 hover:text-blue-900 transition-all shadow-lg hover:shadow-2xl text-lg transform hover:scale-105"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-block bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-blue-700 transition-all shadow-lg text-lg transform hover:scale-105"
            >
              Register
            </Link>
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Products</h2>
            <p className="text-gray-600">Handpicked items just for you</p>
          </div>
          <Link href="/products" className="text-blue-600 hover:text-blue-700 font-semibold text-lg hover:underline flex items-center gap-2">
            View All Products →
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading featured products...</p>
          </div>
        )}
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8 py-16 border-t-2 border-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-4xl shadow-lg">
            🚀
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-900">Fast Delivery</h3>
          <p className="text-gray-600 leading-relaxed">Get your orders delivered to your doorstep in record time.</p>
        </div>
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
          <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-4xl shadow-lg">
            🛡️
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-900">Secure Payment</h3>
          <p className="text-gray-600 leading-relaxed">Your transactions are safe and encrypted with us.</p>
        </div>
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-4xl shadow-lg">
            🎧
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-900">24/7 Support</h3>
          <p className="text-gray-600 leading-relaxed">We are here to help you anytime, anywhere.</p>
        </div>
      </section>
    </div>
  );
}
