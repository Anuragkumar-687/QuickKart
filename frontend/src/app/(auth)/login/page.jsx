'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import AuthShell, { Field } from '../../../components/AuthShell';

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
            const res = await signIn('credentials', { email, password, redirect: false });
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
        <AuthShell title="Welcome back" subtitle="Sign in to your QuickKart account">
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-danger">
                        {error}
                    </div>
                )}
                <Field label="Email address" icon={<Mail />}>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="input pl-11" />
                </Field>
                <Field label="Password" icon={<Lock />}>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="input pl-11" />
                </Field>
                <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                    {loading ? 'Signing in…' : 'Sign in'}
                </button>
            </form>

            <p className="mt-5 rounded-xl border border-dashed bg-card px-4 py-3 text-center text-xs text-muted-foreground">
                Demo: <span className="font-medium text-foreground">user@quickkart.com</span> / <span className="font-medium text-foreground">password123</span>
            </p>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                New to QuickKart?{' '}
                <Link href="/register" className="font-semibold text-primary hover:underline">Create an account</Link>
            </p>
        </AuthShell>
    );
}
