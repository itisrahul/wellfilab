'use client';
import { useEffect, useRef, useState } from 'react';
import { ScoreRing } from '@/components/ui/ScoreRing';

/** Animates up to `pct` (staggered by `delayMs`) every time it scrolls
 * into view — resets and replays on each re-entry rather than once ever,
 * so scrolling back up to a section shows it come alive again instead of
 * sitting at its final value. Makes the homepage's "this is what the
 * product does" preview actually demonstrate the score filling in. */
export function AnimatedRing({ pct, color, size, thick, delayMs = 0 }: {
  pct: number; color: string; size: number; thick: number; delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setValue(pct); return; }
    const el = ref.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        t = setTimeout(() => setValue(pct), delayMs);
      } else {
        clearTimeout(t);
        setValue(0);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => { clearTimeout(t); observer.disconnect(); };
  }, [pct, delayMs]);

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <ScoreRing pct={value} color={color} size={size} thick={thick} />
    </div>
  );
}
