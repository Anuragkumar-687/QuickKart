'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ShoppingCart, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError(res.error);
                setLoading(false);
                return;
            }

            router.push('/');
            router.refresh();
        } catch (error) {
            setError('Something went wrong');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated background dots */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-green-500/5 rounded-full blur-3xl bottom-0 right-0 animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Glowing Orb */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-green-500 opacity-20 blur-2xl absolute inset-0 animate-pulse"></div>
                        <div className="w-32 h-32 rounded-full border-4 border-yellow-400/50 flex items-center justify-center relative backdrop-blur-sm bg-black/40">
                            <ShoppingCart className="w-16 h-16 text-yellow-400" />
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
                        Welcome Back!
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Sign in to access smart, personalized shopping<br />made for you.
                    </p>
                </div>

                {/* Form Card */}
                <div className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
                            <p className="font-medium text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email address*
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all text-white placeholder-gray-500"
                                    placeholder="example@gmail.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password*
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all text-white placeholder-gray-500"
                                    placeholder="@Sn123hsn#"
                                    required
                                />
                            </div>
                        </div>

                        {/* Remember me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-gray-400 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-yellow-400 focus:ring-yellow-400/50 mr-2" />
                                Remember me
                            </label>
                            <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                                Forgot Password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-yellow-400 to-green-400 text-black py-3.5 rounded-xl hover:from-yellow-300 hover:to-green-300 transition-all duration-300 font-bold shadow-lg shadow-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                            ) : (
                                <>
                                    <ShoppingCart className="w-5 h-5" />
                                    <span>Sign in</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-transparent text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 bg-gray-800/50 border border-gray-700 text-white py-3 rounded-xl hover:bg-gray-800 transition-all">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-gray-800/50 border border-gray-700 text-white py-3 rounded-xl hover:bg-gray-800 transition-all">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                            <span>Apple</span>
                        </button>
                    </div>

                    {/* Register Link */}
                    <div className="text-center mt-6">
                        <p className="text-gray-400 text-sm">
                            New to QuickKart?{' '}
                            <Link href="/register" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
