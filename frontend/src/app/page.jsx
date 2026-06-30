'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { TrendingUp, MapPin, Sparkles, Clock, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import RecommendationSection from '../components/RecommendationSection';

export default function Home() {
    const { data: session, status } = useSession();
    const region = session?.user?.region;

    const [trending, setTrending] = useState({ data: [], loading: true });
    const [regional, setRegional] = useState({ data: [], loading: true });
    const [personalized, setPersonalized] = useState({ data: [], loading: false });
    const [recent, setRecent] = useState({ data: [], loading: false });

    // Public sections (work anonymously; backend infers region from the token when logged in)
    useEffect(() => {
        api.get('/recommendations/trending?limit=4')
            .then((r) => setTrending({ data: r.data, loading: false }))
            .catch(() => setTrending({ data: [], loading: false }));
        api.get('/recommendations/region?limit=4')
            .then((r) => setRegional({ data: r.data, loading: false }))
            .catch(() => setRegional({ data: [], loading: false }));
    }, []);

    // Personalized sections (require auth)
    useEffect(() => {
        if (status !== 'authenticated') {
            setPersonalized({ data: [], loading: false });
            setRecent({ data: [], loading: false });
            return;
        }
        setPersonalized({ data: [], loading: true });
        setRecent({ data: [], loading: true });
        api.get('/recommendations/personalized?limit=4')
            .then((r) => setPersonalized({ data: r.data, loading: false }))
            .catch(() => setPersonalized({ data: [], loading: false }));
        api.get('/recommendations/recently-viewed?limit=4')
            .then((r) => setRecent({ data: r.data, loading: false }))
            .catch(() => setRecent({ data: [], loading: false }));
    }, [status]);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
                        Shop smarter with QuickKart
                    </h1>
                    <p className="text-lg text-gray-300 max-w-2xl leading-relaxed mb-8">
                        A region-aware commerce platform — trending products near you, personalized
                        recommendations, and thousands of items across every category.
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 bg-white text-gray-900 px-7 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all"
                    >
                        Browse all products <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* Recommendation rails */}
            <RecommendationSection
                title="Trending Near You"
                subtitle={region ? `Hot in ${region} India right now` : 'What shoppers are loving right now'}
                products={trending.data}
                loading={trending.loading}
                icon={<TrendingUp className="w-6 h-6 text-indigo-600" />}
            />

            <RecommendationSection
                title="Popular In Your Region"
                subtitle={region ? `Most bought across ${region} India` : 'Most bought across the country'}
                products={regional.data}
                loading={regional.loading}
                icon={<MapPin className="w-6 h-6 text-emerald-600" />}
            />

            {status === 'authenticated' && (
                <>
                    <RecommendationSection
                        title="Recommended For You"
                        subtitle="Picked from your interests, region & ratings"
                        products={personalized.data}
                        loading={personalized.loading}
                        icon={<Sparkles className="w-6 h-6 text-amber-500" />}
                    />
                    <RecommendationSection
                        title="Recently Viewed"
                        subtitle="Pick up where you left off"
                        products={recent.data}
                        loading={recent.loading}
                        icon={<Clock className="w-6 h-6 text-gray-500" />}
                    />
                </>
            )}

            {/* CTA */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-6xl text-center bg-gray-50 rounded-3xl py-14 border border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Discover the full catalogue</h2>
                    <p className="text-gray-600 mb-6">Search, filter and sort through thousands of products.</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all"
                    >
                        Shop now <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
