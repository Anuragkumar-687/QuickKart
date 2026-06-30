'use client';

import ProductCard from './ProductCard';

export default function RecommendationSection({ title, subtitle, products, loading, icon }) {
    // Hide the section entirely when there's nothing to show (and not loading).
    if (!loading && (!products || products.length === 0)) return null;

    return (
        <section className="py-8">
            <div className="container mx-auto max-w-6xl px-4">
                <div className="mb-5 flex items-end justify-between">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                            {icon} {title}
                        </h2>
                        {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="h-80 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.slice(0, 4).map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
