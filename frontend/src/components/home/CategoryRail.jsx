'use client';

import Link from 'next/link';
import {
    Smartphone, Shirt, Home, Sparkles, Watch, Laptop, Sofa, Car,
    Utensils, Gem, Package, Footprints,
} from 'lucide-react';
import { useGsapScope } from '../motion/useGsapScroll';
import { gsap } from 'gsap';

// Category names come from the API, so map on substrings rather than exact keys.
const ICONS = [
    [/phone|smartphone|mobile/i, Smartphone],
    [/laptop|computer|tablet/i, Laptop],
    [/watch/i, Watch],
    [/shirt|top|cloth|men|women|apparel/i, Shirt],
    [/shoe|sneaker|footwear/i, Footprints],
    [/furniture|sofa/i, Sofa],
    [/home|decor|kitchen|garden/i, Home],
    [/beauty|skin|fragrance|care/i, Sparkles],
    [/jewel|ring/i, Gem],
    [/grocery|food/i, Utensils],
    [/car|vehicle|motorcycle/i, Car],
];

const iconFor = (name) => ICONS.find(([re]) => re.test(name))?.[1] || Package;

export default function CategoryRail({ categories = [], loading }) {
    const scope = useGsapScope(
        () => {
            gsap.from('[data-cat]', {
                y: 16,
                opacity: 0,
                duration: 0.4,
                stagger: 0.04,
                ease: 'power2.out',
                scrollTrigger: { trigger: '[data-cat-rail]', start: 'top 88%', once: true },
            });
        },
        [categories.length],
    );

    if (loading) {
        return (
            <div className="mx-auto flex max-w-[1400px] gap-6 overflow-hidden px-6 py-5">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex shrink-0 flex-col items-center gap-2">
                        <div className="skeleton h-14 w-14 rounded-full" />
                        <div className="skeleton h-2.5 w-12 rounded" />
                    </div>
                ))}
            </div>
        );
    }
    if (categories.length === 0) return null;

    return (
        <nav ref={scope} aria-label="Shop by category" className="border-b bg-background">
            <div data-cat-rail className="no-scrollbar mx-auto flex max-w-[1400px] gap-5 overflow-x-auto px-6 py-4 sm:gap-8 sm:justify-center">
                {categories.map((c) => {
                    const Icon = iconFor(c);
                    return (
                        <Link
                            key={c}
                            data-cat
                            href={`/products?category=${encodeURIComponent(c)}`}
                            className="group flex shrink-0 flex-col items-center gap-2"
                        >
                            <span className="grid h-14 w-14 place-items-center rounded-full border bg-card text-muted-foreground transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-[var(--primary)] group-hover:text-[var(--primary)]">
                                <Icon className="h-6 w-6" />
                            </span>
                            <span className="max-w-[5.5rem] truncate text-center text-[11px] font-medium capitalize text-muted-foreground transition-colors group-hover:text-foreground">
                                {c}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
