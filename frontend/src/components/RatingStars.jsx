'use client';

import { Star } from 'lucide-react';

export default function RatingStars({ rating = 0, count, size = 'sm', showValue = true }) {
    const filled = Math.round(rating);
    const px = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
    return (
        <div className="flex items-center gap-1.5">
            <div className="flex">
                {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                        key={i}
                        className={`${px} ${i < filled ? 'text-amber-400 fill-amber-400' : 'text-border'}`}
                    />
                ))}
            </div>
            {showValue && (
                <span className="text-xs text-muted-foreground">
                    {Number(rating).toFixed(1)}
                    {count != null ? ` (${count})` : ''}
                </span>
            )}
        </div>
    );
}
