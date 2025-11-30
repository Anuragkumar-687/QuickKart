'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-white shadow-xl border-b-2 border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center h-20">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                            <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            QuickKart
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/products" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors relative group">
                            Products
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        {session?.user?.role === 'admin' && (
                            <Link href="/admin" className="text-gray-700 hover:text-purple-600 font-semibold transition-colors relative group">
                                Admin
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        )}
                        <Link href="/cart" className="text-gray-700 hover:text-blue-600 relative transition-colors group">
                            <div className="relative">
                                <ShoppingCart className="w-6 h-6" />
                                {/* You can add cart count badge here later */}
                            </div>
                        </Link>

                        {session ? (
                            <div className="flex items-center space-x-4 pl-4 border-l-2 border-gray-200">
                                <Link href="/orders" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors relative group">
                                    Orders
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                                <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-blue-50 px-5 py-2.5 rounded-full border border-gray-200">
                                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-1.5 rounded-full">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-gray-800 font-semibold text-sm">{session.user?.name}</span>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded-full hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3 pl-4 border-l-2 border-gray-200">
                                <Link
                                    href="/login"
                                    className="text-gray-700 hover:text-blue-600 font-semibold transition-colors px-4 py-2"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pb-6 border-t border-gray-200 mt-2 pt-6 bg-white rounded-b-2xl shadow-lg">
                        <div className="flex flex-col space-y-4">
                            <Link
                                href="/products"
                                className="text-gray-700 hover:text-blue-600 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-all"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Products
                            </Link>
                            {session?.user?.role === 'admin' && (
                                <Link
                                    href="/admin"
                                    className="text-gray-700 hover:text-purple-600 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-all"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Admin
                                </Link>
                            )}
                            <Link
                                href="/cart"
                                className="text-gray-700 hover:text-blue-600 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-all"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Cart
                            </Link>
                            {session ? (
                                <>
                                    <Link
                                        href="/orders"
                                        className="text-gray-700 hover:text-blue-600 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-all"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Orders
                                    </Link>
                                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 rounded-xl border border-gray-200">
                                        <span className="text-gray-800 font-semibold">Hi, {session.user?.name}</span>
                                    </div>
                                    <button
                                        onClick={() => signOut()}
                                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all w-full text-left font-semibold shadow-md"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-gray-700 hover:text-blue-600 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-all"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all text-center font-semibold shadow-md"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
