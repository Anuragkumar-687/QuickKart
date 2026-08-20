'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { TrendingUp, MapPin, Sparkles, Clock, Zap, Star, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import ProductRail from '../components/ProductRail';
import DealHero from '../components/home/DealHero';
import CategoryRail from '../components/home/CategoryRail';
import DealCountdown from '../components/home/DealCountdown';
import { useGsapScope } from '../components/motion/useGsapScroll';

const emptyFeed = { data: [], loading: true };

export default function Home() {
    const { data: session, status } = useSession();
    const region = session?.user?.region;

    const [trending, setTrending] = useState(emptyFeed);
    const [regional, setRegional] = useState(emptyFeed);
    const [personalized, setPersonalized] = useState({ data: [], loading: false });
    const [recent, setRecent] = useState({ data: [], loading: false });
    const [categories, setCategories] = useState({ data: [], loading: true });
    const [featured, setFeatured] = useState(emptyFeed);
    const [deals, setDeals] = useState(emptyFeed);

    useEffect(() => {
        const settle = (setter) => (r) => setter({ data: r, loading: false });
        const fail = (setter) => () => setter({ data: [], loading: false });

        api.get('/recommendations/trending?limit=12')
            .then((r) => settle(setTrending)(r.data || []))
            .catch(fail(setTrending));

        api.get('/recommendations/region?limit=12')
            .then((r) => settle(setRegional)(r.data || []))
            .catch(fail(setRegional));

        api.get('/products/categories')
            .then((r) => settle(setCategories)(Array.isArray(r.data) ? r.data.slice(0, 12) : []))
            .catch(fail(setCategories));

        api.get('/products?sort=rating_desc&limit=10')
            .then((r) => settle(setFeatured)(r.data?.data || []))
            .catch(fail(setFeatured));

        // "Deals" reuses the newest slice — labelled honestly as new arrivals.
        api.get('/products?sort=newest&limit=12')
            .then((r) => settle(setDeals)(r.data?.data || []))
            .catch(fail(setDeals));
    }, []);

    useEffect(() => {
        if (status !== 'authenticated') {
            setPersonalized({ data: [], loading: false });
            setRecent({ data: [], loading: false });
            return;
        }
        setPersonalized({ data: [], loading: true });
        setRecent({ data: [], loading: true });
        api.get('/recommendations/personalized?limit=12')
            .then((r) => setPersonalized({ data: r.data || [], loading: false }))
            .catch(() => setPersonalized({ data: [], loading: false }));
        api.get('/recommendations/recently-viewed?limit=12')
            .then((r) => setRecent({ data: r.data || [], loading: false }))
            .catch(() => setRecent({ data: [], loading: false }));
    }, [status]);

    // Section cards rise as they enter. Starts from the visible state so
    // reduced-motion users (who skip this entirely) never see blank space.
    const scope = useGsapScope(
        () => {
            gsap.utils.toArray('[data-rise]').forEach((el) => {
                gsap.from(el, {
                    y: 24,
                    opacity: 0,
                    duration: 0.45,
                    ease: 'power2.out',
                    scrollTrigger: { trigger: el, start: 'top 92%', once: true },
                });
            });
        },
        [featured.loading, deals.loading],
    );

    return (
        <div ref={scope} className="pb-8">
            <CategoryRail categories={categories.data} loading={categories.loading} />

            <div className="pt-4 sm:px-6 sm:pt-5">
                <DealHero products={featured.data} loading={featured.loading} />
            </div>

            <div data-rise>
                <ProductRail
                    title="New arrivals"
                    subtitle="Freshly added to the catalogue"
                    products={deals.data}
                    loading={deals.loading}
                    icon={<Zap className="h-5 w-5 text-[var(--primary)]" />}
                    href="/products?sort=newest"
                    accessory={<DealCountdown />}
                />
            </div>

            <div data-rise>
                <ProductRail
                    title="Trending near you"
                    subtitle={region ? `Popular in ${region} India right now` : 'What shoppers are buying right now'}
                    products={trending.data}
                    loading={trending.loading}
                    icon={<TrendingUp className="h-5 w-5 text-[var(--primary)]" />}
                    href="/products?sort=rating_desc"
                />
            </div>

            <div data-rise>
                <ProductRail
                    title="Popular in your region"
                    subtitle={region ? `Most bought across ${region} India` : 'Most bought across the country'}
                    products={regional.data}
                    loading={regional.loading}
                    icon={<MapPin className="h-5 w-5 text-[var(--savings)]" />}
                    href="/products"
                />
            </div>

            {status === 'authenticated' && (
                <>
                    <div data-rise>
                        <ProductRail
                            title="Recommended for you"
                            subtitle="Based on your interests, region and ratings"
                            products={personalized.data}
                            loading={personalized.loading}
                            icon={<Sparkles className="h-5 w-5 text-[var(--primary)]" />}
                        />
                    </div>
                    <div data-rise>
                        <ProductRail
                            title="Recently viewed"
                            subtitle="Pick up where you left off"
                            products={recent.data}
                            loading={recent.loading}
                            icon={<Clock className="h-5 w-5 text-muted-foreground" />}
                        />
                    </div>
                </>
            )}

            {/* Dense grid closes the page — the "keep browsing" surface. */}
            <section data-rise className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
                <div className="card overflow-hidden">
                    <div className="flex items-center justify-between gap-4 border-b px-4 py-3.5 sm:px-5">
                        <h2 className="section-title flex items-center gap-2">
                            <Star className="h-5 w-5 text-[var(--primary)]" />
                            Top rated
                        </h2>
                        <Link
                            href="/products?sort=rating_desc"
                            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--primary)] transition-all hover:gap-1.5"
                        >
                            View all <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-3 lg:grid-cols-5">
                        {featured.loading
                            ? Array.from({ length: 10 }).map((_, i) => (
                                  <div key={i} className="bg-card p-2">
                                      <ProductCardSkeleton />
                                  </div>
                              ))
                            : featured.data.map((p) => (
                                  <div key={p.id || p._id} className="bg-card p-2">
                                      <ProductCard product={p} />
                                  </div>
                              ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
