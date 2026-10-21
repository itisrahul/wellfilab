'use client';
import { useEffect, useRef, useState } from 'react';
import { ScoreRing } from '@/components/ui/ScoreRing';

/** Starts at 0 and animates up to `pct` the first time it scrolls into
 * view (staggered by `delayMs`), instead of just appearing at its final
 * value — makes the homepage's "this is what the product does" preview
 * actually demonstrate the score filling in, not just display a number. */
export function AnimatedRing({ pct, color, size, thick, delayMs = 0 }: {
  pct: number; color: string; size: number; thick: number; delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setValue(pct); return; }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const t = setTimeout(() => setValue(pct), delayMs);
      return () => clearTimeout(t);
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [pct, delayMs]);

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <ScoreRing pct={value} color={color} size={size} thick={thick} />
    </div>
  );
}
