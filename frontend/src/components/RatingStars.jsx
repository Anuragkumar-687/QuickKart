'use client';

import { Star } from 'lucide-react';
import { formatCount } from '../lib/format';

/**
 * Compact rating chip ("4.3 ★") with an optional review count beside it —
 * the pattern Indian marketplaces use because it survives dense grids far
 * better than five separate star glyphs.
 *
 * `variant="stars"` keeps the full star row for the product detail page,
 * where there's room and the extra fidelity is worth it.
 */
export default function RatingStars({ rating = 0, count, variant = 'chip', className = '' }) {
    const value = Number(rating) || 0;

    if (variant === 'stars') {
        const filled = Math.round(value);
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className="flex">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <Star
                            key={i}
                            className={`h-4 w-4 ${i < filled ? 'fill-current text-warning' : 'text-border-strong'}`}
                        />
                    ))}
                </div>
                <span className="num text-sm font-semibold text-foreground">{value.toFixed(1)}</span>
                {count != null && (
                    <span className="num text-sm text-muted-foreground">({formatCount(count)})</span>
                )}
            </div>
        );
    }

    // The chip is colour-coded by score. Painting a 2.3 the same green as a 4.8
    // would misrepresent it — in this palette green means "good for the buyer".
    const tone =
        value >= 3.5
            ? { backgroundColor: 'var(--savings)', color: 'var(--savings-foreground)' }
            : value >= 2.5
              ? { backgroundColor: 'var(--warning)', color: '#1a1204' }
              : { backgroundColor: 'var(--danger)', color: '#ffffff' };

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <span className="rating-chip" style={tone}>
                <span className="num">{value.toFixed(1)}</span>
                <Star className="h-2.5 w-2.5 fill-current" />
            </span>
            {count != null && (
                <span className="num text-[11px] font-medium text-muted-foreground">
                    ({formatCount(count)})
                </span>
            )}
        </div>
    );
}
