'use client';
import { useEffect, useRef, useState } from 'react';

/** Fills from 0 to `pct` width the first time it scrolls into view. */
export function AnimatedBar({ pct, delayMs = 0, color = '#2DD4BF' }: { pct: number; delayMs?: number; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setWidth(pct); return; }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const t = setTimeout(() => setWidth(pct), delayMs);
      return () => clearTimeout(t);
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [pct, delayMs]);

  return (
    <div ref={ref} className="h-1 bg-[#1F3A36] rounded-full my-1 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: color, transition: 'width 1s ease' }} />
    </div>
  );
}
