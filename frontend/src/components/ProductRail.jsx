'use client';

import Link from 'next/link';
import { useRef, useState, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';

/**
 * Horizontal product rail: scroll-snaps on touch, arrow-driven on desktop.
 * Arrows hide when there's nothing further to scroll in that direction.
 */
export default function ProductRail({ title, subtitle, products, loading, icon, badge, href, accessory }) {
    const scrollerRef = useRef(null);
    const [edges, setEdges] = useState({ start: true, end: false });

    const syncEdges = useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        setEdges({
            start: scrollLeft <= 2,
            end: scrollLeft + clientWidth >= scrollWidth - 2,
        });
    }, []);

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;
        syncEdges();
        el.addEventListener('scroll', syncEdges, { passive: true });
        const ro = new ResizeObserver(syncEdges);
        ro.observe(el);
        return () => {
            el.removeEventListener('scroll', syncEdges);
            ro.disconnect();
        };
    }, [syncEdges, products, loading]);

    const nudge = (dir) => {
        const el = scrollerRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 240), behavior: 'smooth' });
    };

    if (!loading && (!products || products.length === 0)) return null;

    return (
        <section className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
            <div className="card overflow-hidden">
                <div className="flex items-center justify-between gap-4 border-b px-4 py-3.5 sm:px-5">
                    <div className="min-w-0">
                        <h2 className="section-title flex items-center gap-2">
                            {icon}
                            <span className="truncate">{title}</span>
                        </h2>
                        {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        {accessory}
                        {href && (
                            <Link
                                href={href}
                                className="hidden items-center gap-1 text-[13px] font-semibold text-[var(--primary)] transition-all hover:gap-1.5 sm:inline-flex"
                            >
                                View all <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        )}
                        <div className="hidden items-center gap-1 md:flex">
                            <button
                                onClick={() => nudge(-1)}
                                disabled={edges.start}
                                aria-label="Scroll left"
                                className="grid h-8 w-8 place-items-center rounded-full border transition hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => nudge(1)}
                                disabled={edges.end}
                                aria-label="Scroll right"
                                className="grid h-8 w-8 place-items-center rounded-full border transition hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div ref={scrollerRef} className="rail no-scrollbar p-3 sm:p-4">
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => (
                              <div key={i} className="w-[46vw] sm:w-[220px]">
                                  <ProductCardSkeleton />
                              </div>
                          ))
                        : products.map((p) => (
                              <div key={p.id || p._id} className="w-[46vw] sm:w-[220px]">
                                  <ProductCard product={p} badge={badge} />
                              </div>
                          ))}
                </div>
            </div>
        </section>
    );
}
