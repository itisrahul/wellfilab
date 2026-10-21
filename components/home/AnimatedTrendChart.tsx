'use client';
import { useEffect, useRef, useState } from 'react';

const MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const SCORES = [58, 62, 67, 72, 76, 81]; // same illustrative sample used elsewhere on this page

const W = 280, H = 90, PAD = 8;

function pointsFor(values: number[]): string {
  const min = Math.min(...values), max = Math.max(...values);
  return values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / (max - min || 1)) * (H - PAD * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

/**
 * Draws itself left-to-right the first time it scrolls into view — the
 * single clearest way to show "your score moves over time" instead of just
 * stating it. Same illustrative sample (58 -> 81) used in the homepage's
 * other example visuals, clearly a trend demo, not claimed real data.
 */
export function AnimatedTrendChart() {
  const ref = useRef<SVGPolylineElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setDrawn(true); return; }
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      requestAnimationFrame(() => setDrawn(true));
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const points = pointsFor(SCORES);
  const length = 300; // comfortably longer than the actual path, safe for dasharray

  return (
    <div ref={wrapRef}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        <polyline
          ref={ref}
          points={points}
          fill="none"
          stroke="#2DD4BF"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: length,
            strokeDashoffset: drawn ? 0 : length,
            transition: 'stroke-dashoffset 1.4s ease',
          }}
        />
        {points.split(' ').map((p, i) => {
          const [x, y] = p.split(',').map(Number);
          return (
            <circle key={i} cx={x} cy={y} r={i === SCORES.length - 1 ? 3.5 : 2.5} fill="#2DD4BF"
              style={{ opacity: drawn ? 1 : 0, transition: `opacity .3s ease ${0.3 + i * 0.2}s` }} />
          );
        })}
      </svg>
      <div className="flex justify-between mt-1">
        {MONTHS.map(m => <span key={m} className="text-[9px] text-[#6F8984]">{m}</span>)}
      </div>
    </div>
  );
}
