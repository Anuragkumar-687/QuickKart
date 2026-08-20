'use client';

const STYLES = {
    trending: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
    savings: 'bg-[var(--savings)] text-[var(--savings-foreground)]',
    top: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
    stock: 'bg-[var(--danger)] text-white',
    neutral: 'border bg-card text-foreground',
};

export default function Badge({ variant = 'neutral', children, className = '' }) {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide leading-none ${
                STYLES[variant] || STYLES.neutral
            } ${className}`}
        >
            {children}
        </span>
    );
}
