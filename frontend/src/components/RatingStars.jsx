'use client';

import { Star } from 'lucide-react';

export default function RatingStars({ rating = 0, count, size = 'sm', showValue = true }) {
  const filled = Math.round(rating);
  const px = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className={`${px} ${i < filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs text-gray-500">
          {Number(rating).toFixed(1)}
          {count != null ? ` (${count})` : ''}
        </span>
      )}
    </div>
  );
}
