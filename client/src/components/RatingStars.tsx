import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating?: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  count,
  size = 'sm',
  showCount = true
}) => {
  const numericRating = typeof rating === 'number' && !isNaN(rating) ? rating : (Number(rating) || 0);
  const numericCount = typeof count === 'number' && !isNaN(count) ? count : (count !== undefined ? Number(count) : undefined);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSizes[size]} ${
              star <= Math.floor(numericRating)
                ? 'fill-amber-400 text-amber-400'
                : star - 0.5 <= numericRating
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-slate-300 dark:text-slate-700'
            }`}
          />
        ))}
      </div>
      <span className={`font-semibold text-slate-700 dark:text-slate-300 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {numericRating.toFixed(1)}
      </span>
      {showCount && numericCount !== undefined && (
        <span className="text-xs text-slate-400 font-normal">({numericCount})</span>
      )}
    </div>
  );
};
