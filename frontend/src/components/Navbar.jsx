'use client';

import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { data: session } = useSession();
    const { cartCount } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-gray-50 shadow-sm sticky top-0 z-50 border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 shrink-0 group">
                        <ShoppingCart className="w-6 h-6 text-gray-900" />
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">
                            QuickKart
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/products" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                            Products
                        </Link>
                        {session?.user?.role === 'admin' && (
                            <Link href="/admin" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                Admin
                            </Link>
                        )}

                        <Link href="/cart" className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-2 group">
                            <div className="relative">
                                <ShoppingCart className="w-5 h-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <span>Cart</span>
                        </Link>

                        {session ? (
                            <div className="flex items-center space-x-6 pl-6 border-l border-gray-200">
                                <Link href="/orders" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                    Orders
                                </Link>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-gray-900 font-medium bg-gray-100 px-3 py-1.5 rounded-full">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span>{session.user?.name}</span>
                                    </div>
                                    <button
                                        onClick={() => signOut()}
                                        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/login"
                                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-gray-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-700"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100">
                        <div className="flex flex-col space-y-4">
                            <Link href="/products" className="text-gray-600 hover:text-blue-600 font-medium px-2">
                                Products
                            </Link>
                            {session?.user?.role === 'admin' && (
                                <Link href="/admin" className="text-gray-600 hover:text-blue-600 font-medium px-2">
                                    Admin Dashboard
                                </Link>
                            )}
                            <Link href="/cart" className="text-gray-600 hover:text-blue-600 font-medium px-2">
                                Cart
                            </Link>

                            {session ? (
                                <div className="pt-4 border-t border-gray-100 space-y-4">
                                    <Link href="/orders" className="text-gray-600 hover:text-blue-600 font-medium px-2 block">
                                        My Orders
                                    </Link>
                                    <div className="px-2 text-gray-900 font-medium flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        {session.user?.name}
                                    </div>
                                    <button
                                        onClick={() => signOut()}
                                        className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 py-2 rounded-lg font-medium"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-3 pt-2">
                                    <Link
                                        href="/login"
                                        className="text-gray-600 hover:text-blue-600 font-medium text-center py-2"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center font-medium"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
