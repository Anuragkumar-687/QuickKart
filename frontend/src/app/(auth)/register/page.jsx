'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';
import { Mail, Lock, User, MapPin } from 'lucide-react';
import AuthShell, { Field } from '../../../components/AuthShell';

const STATES = [
    'Delhi', 'Haryana', 'Punjab', 'Himachal Pradesh', 'Uttarakhand', 'Uttar Pradesh', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Rajasthan',
    'Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana', 'Puducherry',
    'Bihar', 'Jharkhand', 'Odisha', 'West Bengal', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Maharashtra', 'Madhya Pradesh',
    'Assam', 'Arunachal Pradesh', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura', 'Sikkim',
];

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/signup', {
                name,
                email,
                password,
                ...(state ? { state } : {}),
                ...(city ? { city } : {}),
                ...(pincode ? { pincode } : {}),
            });
            router.push('/login');
        } catch (error) {
            setError(error.response?.data?.message || 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <AuthShell title="Create your account" subtitle="Join QuickKart for a personalized experience">
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-danger">
                        {error}
                    </div>
                )}

                <Field label="Full name" icon={<User />}>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Alex Smith" className="input pl-11" />
                </Field>
                <Field label="Email address" icon={<Mail />}>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="input pl-11" />
                </Field>
                <Field label="Password" icon={<Lock />}>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" className="input pl-11" />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="State" icon={<MapPin />}>
                        <select value={state} onChange={(e) => setState(e.target.value)} className="input pl-11">
                            <option value="">Select state</option>
                            {STATES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="City">
                        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" className="input" />
                    </Field>
                </div>

                <Field label="Pincode">
                    <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="400001" className="input" />
                </Field>
                <p className="-mt-2 text-xs text-muted-foreground">Optional — used to personalize region-based recommendations.</p>

                <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                    {loading ? 'Creating account…' : 'Create account'}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-accent hover:underline">Sign in</Link>
            </p>
        </AuthShell>
    );
}
