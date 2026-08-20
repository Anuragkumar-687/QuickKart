'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, AlertTriangle, Flame, RotateCcw, TrendingUp, Eye, Boxes, MapPin } from 'lucide-react';
import api from '../../../lib/api';
import Reveal from '../../../components/motion/Reveal';
import AnimatedNumber from '../../../components/motion/AnimatedNumber';
import BarList from '../../../components/charts/BarList';
import ProgressRing from '../../../components/charts/ProgressRing';

const DEMAND_STYLES = {
    High: 'bg-emerald-500/10 text-emerald-400',
    Medium: 'bg-amber-500/10 text-amber-400',
    Low: 'bg-muted text-muted-foreground',
};

function StatCard({ icon: Icon, label, value, suffix = '', tint = 'text-primary' }) {
    return (
        <div className="card p-5">
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl border bg-card ${tint}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-foreground">
                <AnimatedNumber value={value} suffix={suffix} />
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{label}</div>
        </div>
    );
}

export default function AnalyticsDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [dash, setDash] = useState(null);
    const [alerts, setAlerts] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [statusInfo, setStatusInfo] = useState({ total: 0 });

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
        else if (status === 'authenticated' && session?.user?.role !== 'admin') router.push('/');
    }, [status, session, router]);

    useEffect(() => {
        if (session?.user?.role !== 'admin') return;
        Promise.allSettled([
            api.get('/analytics/regions?limit=6'),
            api.get('/inventory/alerts'),
            api.get('/inventory/forecast'),
            api.get('/ingestion/status'),
        ])
            .then(([d, a, f, s]) => {
                if (d.status === 'fulfilled') setDash(d.value.data);
                if (a.status === 'fulfilled') setAlerts(a.value.data);
                if (f.status === 'fulfilled') setForecast(Array.isArray(f.value.data) ? f.value.data : []);
                if (s.status === 'fulfilled') setStatusInfo(s.value.data);
            })
            .finally(() => setLoading(false));
    }, [session]);

    if (status === 'loading' || (loading && session?.user?.role === 'admin')) {
        return (
            <div className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-8 h-8 w-56 skeleton rounded" />
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}
                </div>
                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-72 skeleton rounded-2xl" />)}
                </div>
            </div>
        );
    }

    if (session?.user?.role !== 'admin') return null;

    const totalProducts = statusInfo?.total || 0;
    const lowStock = alerts?.counts?.lowStock || 0;
    const highDemand = alerts?.counts?.highDemand || 0;
    const reorder = alerts?.counts?.reorderSuggestions || 0;
    const inStock = Math.max(0, totalProducts - lowStock);

    const categoryData = (dash?.mostPurchasedCategories || []).map((c) => ({ label: c.category, value: c.unitsSold }));
    const viewedData = (dash?.mostViewedProducts || []).map((m) => ({ label: m.product?.name || 'Product', value: m.views }));
    const topForecast = [...forecast].sort((a, b) => b.demandScore - a.demandScore).slice(0, 6);
    const byRegion = dash?.topProductsByRegion || {};

    return (
        <div className="mx-auto max-w-7xl px-6 py-10">
            <Link href="/admin" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to dashboard
            </Link>
            <Reveal>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics Dashboard</h1>
                <p className="mt-1 text-sm text-muted-foreground">Region-aware commerce intelligence, live from your data.</p>
            </Reveal>

            {/* Stat cards */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <Reveal delay={0}><StatCard icon={Package} label="Total products" value={totalProducts} tint="text-primary" /></Reveal>
                <Reveal delay={0.06}><StatCard icon={AlertTriangle} label="Low-stock items" value={lowStock} tint="text-amber-400" /></Reveal>
                <Reveal delay={0.12}><StatCard icon={Flame} label="High-demand items" value={highDemand} tint="text-rose-400" /></Reveal>
                <Reveal delay={0.18}><StatCard icon={RotateCcw} label="Reorder suggestions" value={reorder} tint="text-emerald-400" /></Reveal>
            </div>

            {/* Charts */}
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <Reveal>
                    <div className="card h-full p-6">
                        <h2 className="mb-5 flex items-center gap-2 font-bold text-foreground"><TrendingUp className="h-5 w-5 text-primary" /> Most purchased categories</h2>
                        <BarList data={categoryData} format={(v) => `${v} units`} />
                    </div>
                </Reveal>
                <Reveal delay={0.08}>
                    <div className="card h-full p-6">
                        <h2 className="mb-5 flex items-center gap-2 font-bold text-foreground"><Eye className="h-5 w-5 text-primary" /> Most viewed products</h2>
                        <BarList data={viewedData} format={(v) => `${v} views`} barClass="bg-violet-500" />
                    </div>
                </Reveal>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
                {/* Inventory health */}
                <Reveal>
                    <div className="card flex h-full flex-col items-center justify-center p-6 text-center">
                        <h2 className="mb-4 flex items-center gap-2 self-start font-bold text-foreground"><Boxes className="h-5 w-5 text-primary" /> Inventory health</h2>
                        <ProgressRing value={inStock} max={totalProducts || 1} label="in stock" />
                        <p className="mt-4 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{inStock}</span> healthy · <span className="font-medium text-amber-400">{lowStock}</span> low
                        </p>
                    </div>
                </Reveal>

                {/* Demand forecast */}
                <Reveal delay={0.08} className="lg:col-span-2">
                    <div className="card h-full p-6">
                        <h2 className="mb-5 flex items-center gap-2 font-bold text-foreground"><MapPin className="h-5 w-5 text-primary" /> Demand forecast by region</h2>
                        {topForecast.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No purchase data yet — forecasts appear after orders.</p>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {topForecast.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between rounded-xl border bg-background/40 px-4 py-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-foreground">{f.category}</p>
                                            <p className="text-xs text-muted-foreground">{f.region}</p>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${DEMAND_STYLES[f.demand] || DEMAND_STYLES.Low}`}>{f.demand}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Reveal>
            </div>

            {/* Top products by region */}
            {Object.keys(byRegion).length > 0 && (
                <Reveal className="mt-6">
                    <div className="card p-6">
                        <h2 className="mb-5 flex items-center gap-2 font-bold text-foreground"><MapPin className="h-5 w-5 text-primary" /> Top product by region</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(byRegion).map(([region, list]) => {
                                const top = list?.[0];
                                if (!top) return null;
                                return (
                                    <div key={region} className="rounded-xl border bg-background/40 p-4">
                                        <p className="mb-1 text-xs uppercase tracking-wide text-primary">{region}</p>
                                        <p className="line-clamp-1 text-sm font-medium text-foreground">{top.product?.name || 'Product'}</p>
                                        <p className="text-xs text-muted-foreground">{top.unitsSold} units sold</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Reveal>
            )}

            {/* Reorder suggestions */}
            {alerts?.reorderSuggestions?.length > 0 && (
                <Reveal className="mt-6">
                    <div className="card overflow-hidden">
                        <div className="border-b px-6 py-4"><h2 className="flex items-center gap-2 font-bold text-foreground"><RotateCcw className="h-5 w-5 text-primary" /> Reorder suggestions</h2></div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                                        <th className="px-6 py-3 font-medium">Product</th>
                                        <th className="px-6 py-3 font-medium">Stock</th>
                                        <th className="px-6 py-3 font-medium">Recent demand</th>
                                        <th className="px-6 py-3 font-medium">Suggested reorder</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {alerts.reorderSuggestions.slice(0, 8).map((r) => (
                                        <tr key={r.productId} className="hover:bg-muted/40">
                                            <td className="px-6 py-3 font-medium text-foreground"><span className="line-clamp-1 max-w-xs">{r.name}</span></td>
                                            <td className="px-6 py-3 text-amber-400">{r.stock}</td>
                                            <td className="px-6 py-3 text-muted-foreground">{r.recentDemand}</td>
                                            <td className="px-6 py-3 font-semibold text-emerald-400">+{r.suggestedReorderQty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Reveal>
            )}
        </div>
    );
}
