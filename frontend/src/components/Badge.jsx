'use client';

const STYLES = {
    trending: 'bg-accent text-accent-foreground',
    new: 'bg-emerald-500 text-white',
    sale: 'bg-rose-500 text-white',
    top: 'bg-foreground text-background',
    stock: 'bg-amber-500 text-white',
    neutral: 'bg-card/90 text-foreground border',
};

export default function Badge({ variant = 'neutral', children, className = '' }) {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none backdrop-blur ${STYLES[variant] || STYLES.neutral} ${className}`}
        >
            {children}
        </span>
    );
}
