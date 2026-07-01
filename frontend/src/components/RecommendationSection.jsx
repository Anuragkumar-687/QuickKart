'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import Reveal, { EASE } from './motion/Reveal';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } };

export default function RecommendationSection({ title, subtitle, products, loading, icon, badge, href }) {
    const reduced = useReducedMotion();
    if (!loading && (!products || products.length === 0)) return null;

    return (
        <section className="py-10">
            <div className="mx-auto max-w-7xl px-6">
                <Reveal className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                            {icon}
                            {title}
                        </h2>
                        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
                    </div>
                    {href && (
                        <Link href={href} className="hidden shrink-0 items-center gap-1 text-sm font-medium text-accent transition-all hover:gap-2 sm:inline-flex">
                            View all <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}
                </Reveal>

                <motion.div
                    variants={reduced ? undefined : container}
                    initial={reduced ? undefined : 'hidden'}
                    whileInView={reduced ? undefined : 'show'}
                    viewport={{ once: true, margin: '-60px' }}
                    className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
                >
                    {loading
                        ? [0, 1, 2, 3].map((i) => <ProductCardSkeleton key={i} />)
                        : products.slice(0, 4).map((p) => (
                              <motion.div key={p.id} variants={reduced ? undefined : item}>
                                  <ProductCard product={p} badge={badge} />
                              </motion.div>
                          ))}
                </motion.div>
            </div>
        </section>
    );
}
