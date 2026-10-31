'use client';
import { useEffect, useRef, useState } from 'react';

/** Counts up from 0 to `value` every time it scrolls into view — replays
 * on each re-entry instead of once ever. Used for the homepage's real
 * stat numbers (calculator count, guide count), never for invented
 * statistics. Renders the final value immediately under
 * prefers-reduced-motion. */
export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setDisplay(value); return; }
    const el = ref.current;
    if (!el) return;
    let raf: number;
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (!entry.isIntersecting) { setDisplay(0); return; }
      const start = performance.now();
      const duration = 900;
      function tick(now: number) {
        const p = Math.min(1, (now - start) / duration);
        setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, [value]);

  return <span ref={ref}>{display}{suffix}</span>;
}
