import { useId } from 'react';

/** A plain half-star-capable rating display — used anywhere a derived
 * rubric score (never a hand-typed number) needs a quick visual read.
 * See lib/comparisons.ts's overallRating() for how the value is computed. */
export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const uid = useId();
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const isHalf = !filled && i === full && half;
        const gradId = `star-half-${uid}-${i}`;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 20 20" className="flex-shrink-0">
            {isHalf && (
              <defs>
                <linearGradient id={gradId}>
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            )}
            <path
              d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8z"
              fill={filled ? '#f59e0b' : isHalf ? `url(#${gradId})` : 'none'}
              stroke={filled || isHalf ? 'none' : 'currentColor'} strokeWidth={filled || isHalf ? 0 : 1.25}
              className="text-gray-300 dark:text-gray-600"
            />
          </svg>
        );
      })}
      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 ml-1 tabular-nums">{value.toFixed(1)}</span>
    </span>
  );
}
