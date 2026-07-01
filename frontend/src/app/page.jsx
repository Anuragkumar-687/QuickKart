'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';

// Run before paint on the client (no SSR warning) so the hero never flashes.
const useIsoEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import { motion, useReducedMotion } from 'framer-motion';
import {
    TrendingUp, MapPin, Sparkles, Clock, ArrowRight, Truck, ShieldCheck, RefreshCcw,
    Brain, BarChart3, Zap, Star, Quote, Mail, Check,
} from 'lucide-react';
import api from '../lib/api';
import RecommendationSection from '../components/RecommendationSection';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import Reveal from '../components/motion/Reveal';
import Magnetic from '../components/motion/Magnetic';
import AnimatedNumber from '../components/motion/AnimatedNumber';

const splitWords = (str) =>
    str.split(' ').map((w, i) => (
        <span key={`${w}-${i}`} className="hero-word inline-block">
            {w}&nbsp;
        </span>
    ));

const WHY = [
    { icon: Brain, title: 'AI Recommendations', text: 'Rule-based scoring blends your interests, region, ratings and trends.' },
    { icon: MapPin, title: 'Region-Aware', text: 'Trending and popular feeds tuned to your state and region.' },
    { icon: Zap, title: 'Lightning Fast', text: 'Server-side search, pagination and caching for an instant feel.' },
    { icon: ShieldCheck, title: 'Secure by Design', text: 'JWT auth, RBAC and validated APIs protect every request.' },
];

const TESTIMONIALS = [
    { name: 'Aarav Mehta', role: 'Mumbai', text: 'The recommendations actually feel personal. Found exactly what I needed in seconds.' },
    { name: 'Sofia Khan', role: 'Bengaluru', text: 'Easily the smoothest shopping UI I have used this year. Fast and beautiful.' },
    { name: 'Daniel Roy', role: 'Kolkata', text: 'Trending near me is genuinely useful — discovered products I would have missed.' },
    { name: 'Neha Verma', role: 'Delhi', text: 'Checkout was effortless and the whole thing just feels premium.' },
    { name: 'Liam Carter', role: 'Pune', text: 'Wishlist, reviews, recommendations — it all just works and looks stunning.' },
];

export default function Home() {
    const { data: session, status } = useSession();
    const region = session?.user?.region;
    const reduced = useReducedMotion();
    const heroRef = useRef(null);

    const [trending, setTrending] = useState({ data: [], loading: true });
    const [regional, setRegional] = useState({ data: [], loading: true });
    const [personalized, setPersonalized] = useState({ data: [], loading: false });
    const [recent, setRecent] = useState({ data: [], loading: false });
    const [categories, setCategories] = useState([]);
    const [featured, setFeatured] = useState({ data: [], loading: true });
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        api.get('/recommendations/trending?limit=4').then((r) => setTrending({ data: r.data, loading: false })).catch(() => setTrending({ data: [], loading: false }));
        api.get('/recommendations/region?limit=4').then((r) => setRegional({ data: r.data, loading: false })).catch(() => setRegional({ data: [], loading: false }));
        api.get('/products/categories').then((r) => setCategories(Array.isArray(r.data) ? r.data.slice(0, 10) : [])).catch(() => setCategories([]));
        api.get('/products?sort=rating_desc&limit=8').then((r) => setFeatured({ data: r.data.data || [], loading: false })).catch(() => setFeatured({ data: [], loading: false }));
    }, []);

    useEffect(() => {
        if (status !== 'authenticated') {
            setPersonalized({ data: [], loading: false });
            setRecent({ data: [], loading: false });
            return;
        }
        setPersonalized({ data: [], loading: true });
        setRecent({ data: [], loading: true });
        api.get('/recommendations/personalized?limit=4').then((r) => setPersonalized({ data: r.data, loading: false })).catch(() => setPersonalized({ data: [], loading: false }));
        api.get('/recommendations/recently-viewed?limit=4').then((r) => setRecent({ data: r.data, loading: false })).catch(() => setRecent({ data: [], loading: false }));
    }, [status]);

    // GSAP hero timeline
    useIsoEffect(() => {
        if (reduced || !heroRef.current) return;
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
            tl.from('.hero-badge', { y: 20, opacity: 0, duration: 0.6 })
                .from('.hero-word', { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.05 }, '-=0.2')
                .from('.hero-sub', { y: 20, opacity: 0, duration: 0.7 }, '-=0.45')
                .from('.hero-cta', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.4')
                .from('.hero-stat', { y: 20, opacity: 0, duration: 0.6, stagger: 0.12 }, '-=0.3');
        }, heroRef);
        return () => ctx.revert();
    }, [reduced]);

    return (
        <div className="overflow-x-hidden">
            {/* ---------------- Hero ---------------- */}
            <section ref={heroRef} className="relative px-6 pb-16 pt-8 md:pb-24 md:pt-14">
                <div className="mx-auto max-w-5xl text-center">
                    <div className="hero-badge mx-auto inline-flex items-center gap-2 rounded-full border bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                        </span>
                        AI-powered, region-aware recommendations
                    </div>

                    <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-[1.04] tracking-tight sm:text-6xl md:text-7xl">
                        <span className="block">{splitWords('Shop smarter. Discover')}</span>
                        <span className="block">
                            {splitWords("what's")}{' '}
                            <span className="hero-word text-gradient animate-gradient inline-block">trending near you.</span>
                        </span>
                    </h1>

                    <p className="hero-sub mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                        Thousands of products, personalized to your region and taste — wrapped in a fast,
                        premium shopping experience.
                    </p>

                    <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                        <Magnetic>
                            <Link href="/products" className="hero-cta btn btn-accent btn-lg">Start shopping <ArrowRight className="h-4 w-4" /></Link>
                        </Magnetic>
                        <Link href="/products?sort=rating_desc" className="hero-cta btn btn-outline btn-lg">Explore top rated</Link>
                    </div>

                    <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4">
                        {[
                            { n: 200, suffix: '+', label: 'Products' },
                            { n: 5, suffix: '', label: 'Regions' },
                            { n: 28, suffix: '+', label: 'Categories' },
                        ].map((s) => (
                            <div key={s.label} className="hero-stat">
                                <div className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                                    <AnimatedNumber value={s.n} suffix={s.suffix} />
                                </div>
                                <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------------- Categories ---------------- */}
            {categories.length > 0 && (
                <section className="mx-auto max-w-7xl px-6 py-8">
                    <Reveal className="mb-5 flex items-end justify-between">
                        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Shop by category</h2>
                        <Link href="/products" className="text-sm font-medium text-accent hover:underline">All categories</Link>
                    </Reveal>
                    <div className="flex flex-wrap gap-2.5">
                        {categories.map((c, i) => (
                            <Reveal key={c} as="div" delay={i * 0.03} y={12}>
                                <Link href={`/products?category=${encodeURIComponent(c)}`} className="chip">{c}</Link>
                            </Reveal>
                        ))}
                    </div>
                </section>
            )}

            {/* ---------------- Recommendation rails ---------------- */}
            <RecommendationSection
                title="Trending Near You"
                subtitle={region ? `Hot in ${region} India right now` : 'What shoppers are loving right now'}
                products={trending.data}
                loading={trending.loading}
                icon={<TrendingUp className="h-6 w-6 text-accent" />}
                badge={{ label: 'Trending', variant: 'trending' }}
                href="/products?sort=rating_desc"
            />
            <RecommendationSection
                title="Popular In Your Region"
                subtitle={region ? `Most bought across ${region} India` : 'Most bought across the country'}
                products={regional.data}
                loading={regional.loading}
                icon={<MapPin className="h-6 w-6 text-emerald-400" />}
                href="/products"
            />
            {status === 'authenticated' && (
                <>
                    <RecommendationSection title="Recommended For You" subtitle="Picked from your interests, region & ratings" products={personalized.data} loading={personalized.loading} icon={<Sparkles className="h-6 w-6 text-amber-400" />} />
                    <RecommendationSection title="Recently Viewed" subtitle="Pick up where you left off" products={recent.data} loading={recent.loading} icon={<Clock className="h-6 w-6 text-muted-foreground" />} />
                </>
            )}

            {/* ---------------- Featured ---------------- */}
            <section className="mx-auto max-w-7xl px-6 py-10">
                <Reveal className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
                            <Star className="h-6 w-6 text-amber-400" /> Featured Products
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">Highest-rated picks across the catalogue</p>
                    </div>
                    <Link href="/products?sort=rating_desc" className="hidden items-center gap-1 text-sm font-medium text-accent transition-all hover:gap-2 sm:inline-flex">View all <ArrowRight className="h-4 w-4" /></Link>
                </Reveal>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                    {featured.loading
                        ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                        : featured.data.map((p, i) => (
                              <Reveal key={p.id} delay={(i % 4) * 0.06}>
                                  <ProductCard product={p} />
                              </Reveal>
                          ))}
                </div>
            </section>

            {/* ---------------- Why QuickKart ---------------- */}
            <section className="mx-auto max-w-7xl px-6 py-16">
                <Reveal className="mx-auto mb-12 max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Why QuickKart <span className="text-gradient">AI</span></h2>
                    <p className="mt-3 text-muted-foreground">A commerce platform engineered like a product, not a template.</p>
                </Reveal>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {WHY.map((f, i) => (
                        <Reveal key={f.title} delay={i * 0.08}>
                            <div className="card group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40">
                                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-110">
                                    <f.icon className="h-6 w-6" />
                                </div>
                                <h3 className="mb-1.5 font-semibold text-foreground">{f.title}</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">{f.text}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ---------------- Analytics features ---------------- */}
            <section className="mx-auto max-w-7xl px-6 py-16">
                <div className="card relative overflow-hidden p-8 md:p-14">
                    <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-[100px]" />
                    <div className="relative grid items-center gap-12 lg:grid-cols-2">
                        <Reveal>
                            <span className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                                <BarChart3 className="h-3.5 w-3.5 text-accent" /> Commerce intelligence
                            </span>
                            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Analytics that power the experience</h2>
                            <p className="mt-4 text-muted-foreground">
                                Every view, click, cart-add and purchase feeds a regional trending engine and a
                                rule-based recommendation system — turning behaviour into better discovery.
                            </p>
                            <ul className="mt-6 space-y-3 text-sm">
                                {['Regional trending rankings', 'Demand forecasting & inventory signals', 'Personalized recommendation scoring'].map((t) => (
                                    <li key={t} className="flex items-center gap-3 text-foreground">
                                        <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/15 text-accent"><Check className="h-3 w-3" /></span>
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        </Reveal>
                        <Reveal delay={0.1} className="grid grid-cols-2 gap-4">
                            {[
                                { v: 12000, s: '+', l: 'Events tracked', d: 0 },
                                { v: 5, s: '', l: 'Regions ranked', d: 0 },
                                { v: 40, s: '%', l: 'Region weight', d: 0 },
                                { v: 4.8, s: '', l: 'Avg. rating', d: 1 },
                            ].map((m) => (
                                <div key={m.l} className="rounded-2xl border bg-background/40 p-5 backdrop-blur">
                                    <div className="text-3xl font-bold tracking-tight text-foreground">
                                        <AnimatedNumber value={m.v} suffix={m.s} decimals={m.d} />
                                    </div>
                                    <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{m.l}</div>
                                </div>
                            ))}
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ---------------- Testimonials ---------------- */}
            <section className="py-16">
                <Reveal className="mx-auto mb-10 max-w-2xl px-6 text-center">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Loved by shoppers</h2>
                    <p className="mt-3 text-muted-foreground">Real reactions to the QuickKart experience.</p>
                </Reveal>
                <div className="relative overflow-hidden">
                    <div className="flex w-max gap-5 marquee hover:[animation-play-state:paused]">
                        {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                            <div key={i} className="w-[20rem] shrink-0 rounded-2xl border bg-card p-6">
                                <Quote className="h-6 w-6 text-accent/60" />
                                <p className="mt-3 text-sm leading-relaxed text-foreground">{t.text}</p>
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="grid h-9 w-9 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent">{t.name.charAt(0)}</div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{t.name}</p>
                                        <p className="text-xs text-muted-foreground">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-surface to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-surface to-transparent" />
                </div>
            </section>

            {/* ---------------- Newsletter ---------------- */}
            <section className="mx-auto max-w-7xl px-6 py-16">
                <Reveal>
                    <div className="card relative overflow-hidden p-10 text-center md:p-16">
                        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
                        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-accent/20 blur-[110px]" />
                        <div className="relative">
                            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Stay in the loop</h2>
                            <p className="mx-auto mt-3 max-w-md text-muted-foreground">Get drops, price alerts and trending picks for your region.</p>
                            {subscribed ? (
                                <p className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 font-medium text-emerald-400">
                                    <Check className="h-5 w-5" /> You&apos;re subscribed!
                                </p>
                            ) : (
                                <form onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSubscribed(true); }} className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input rounded-full pl-11" />
                                    </div>
                                    <button type="submit" className="btn btn-accent btn-lg">Subscribe</button>
                                </form>
                            )}
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ---------------- Final CTA ---------------- */}
            <section className="mx-auto max-w-7xl px-6 pb-20">
                <Reveal>
                    <div className="relative overflow-hidden rounded-3xl border bg-primary px-8 py-16 text-center text-primary-foreground">
                        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready to discover your next favourite?</h2>
                        <p className="mx-auto mt-3 max-w-md text-primary-foreground/70">Thousands of products, one premium experience.</p>
                        <Magnetic className="mt-7 inline-block">
                            <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-background px-7 py-3.5 font-semibold text-foreground transition hover:opacity-90">
                                Shop now <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Magnetic>
                    </div>
                </Reveal>
            </section>
        </div>
    );
}
