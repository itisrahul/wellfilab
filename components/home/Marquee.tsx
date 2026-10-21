'use client';
import type { ReactNode } from 'react';

/** Infinite horizontal ticker — duplicates its children once so the loop
 * is seamless, pauses on hover/focus, and simply renders one static row
 * under prefers-reduced-motion instead of animating. */
export function Marquee({ items, className = '' }: { items: ReactNode[]; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
      }}
    >
      <div className="flex w-max gap-3 animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex-shrink-0">{item}</div>
        ))}
      </div>
    </div>
  );
}
