'use client';
import { useEffect, useRef, useState } from 'react';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { scoreColor } from '@/lib/wellfilab-score';

const FRAMES = [
  { title: 'Take your score', body: '2 minutes, real numbers — sleep, income, savings, debt. See exactly why you scored what you scored.' },
  { title: 'Get your roadmap', body: 'Your weakest areas become a phased plan. Step 2 only unlocks after Step 1 — never a 40-item list on day one.' },
  { title: 'Set a goal', body: 'Turn any target — a score, a net worth number, a sleep goal — into something you can actually track.' },
  { title: 'Watch your dashboard', body: 'Check in daily. Watch your real score move over real time, not a one-time snapshot.' },
];

const FRAME_MS = 4200;

function ScoreVisual() {
  const [pct, setPct] = useState(0);
  useEffect(() => { const t = setTimeout(() => setPct(74), 250); return () => clearTimeout(t); }, []);
  const color = scoreColor(pct || 74);
  return (
    <div className="flex items-center gap-5">
      <div className="relative flex-shrink-0" style={{ width: 92, height: 92 }}>
        <ScoreRing pct={pct} color={color} size={92} thick={8} />
        <div className="absolute inset-0 flex items-center justify-center font-mono tabular-nums font-black text-2xl" style={{ color }}>{pct}</div>
      </div>
      <div className="grid gap-2.5 flex-1">
        {['Sleep', 'Exercise', 'Stress'].map((l, i) => (
          <div key={l}>
            <div className="flex justify-between text-[11px] text-gray-400 mb-1"><span>{l}</span></div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full transition-all ease-out" style={{ width: pct ? `${[70, 45, 60][i]}%` : '0%', transitionDuration: '900ms', transitionDelay: `${i * 150}ms` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoadmapVisual() {
  const items = ['Build a 3-month emergency fund', 'Sleep 7+ hours nightly', 'Start a ₹5,000 SIP'];
  const [checked, setChecked] = useState(-1);
  useEffect(() => {
    const timers = items.map((_, i) => setTimeout(() => setChecked(i), 500 + i * 650));
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div className="grid gap-3 w-full">
      {items.map((label, i) => (
        <div key={label} className="flex items-center gap-2.5">
          <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors duration-300 ${checked >= i ? 'bg-teal-500 border-teal-500' : 'border-gray-300 dark:border-gray-600'}`}>
            {checked >= i && <svg viewBox="0 0 12 12" className="w-3 h-3"><path d="M2 6l2.5 2.5L10 3" stroke="white" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </span>
          <span className={`text-sm transition-colors duration-300 ${checked >= i ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300 font-medium'}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function GoalVisual() {
  const [pct, setPct] = useState(0);
  useEffect(() => { const t = setTimeout(() => setPct(63), 250); return () => clearTimeout(t); }, []);
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        <span>Emergency fund</span><span className="font-mono tabular-nums">{pct}%</span>
      </div>
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-teal-500 rounded-full transition-all duration-[1400ms] ease-out" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400">₹94,500 of ₹1,50,000 — on track, ~3 months at this pace</p>
    </div>
  );
}

const SCORES = [58, 64, 69, 75, 81];
function DashboardVisual() {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 200); return () => clearTimeout(t); }, []);
  const max = Math.max(...SCORES), min = Math.min(...SCORES);
  const pts = SCORES.map((v, i) => {
    const x = (i / (SCORES.length - 1)) * 260 + 10;
    const y = 80 - ((v - min) / (max - min)) * 60 - 5;
    return `${x},${y}`;
  }).join(' ');
  return (
    <div className="w-full">
      <svg viewBox="0 0 280 90" className="w-full" style={{ height: 90 }}>
        <polyline points={pts} fill="none" stroke="#2DD4BF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: 320, strokeDashoffset: drawn ? 0 : 320, transition: 'stroke-dashoffset 1.6s ease' }} />
      </svg>
      <p className="text-xs text-gray-400 mt-1">+23 points in 5 months — real check-ins, not a guess</p>
    </div>
  );
}

const VISUALS = [ScoreVisual, RoadmapVisual, GoalVisual, DashboardVisual];

/**
 * A self-playing 4-frame product tour — the homepage's main "explain what
 * we do, simply" element, built as a looping web animation (no video/gif
 * file to host or keep in sync; each frame's visual is a small live
 * component, not a static image). Pauses on hover/focus and whenever the
 * user has prefers-reduced-motion set, where it just shows frame 1 still.
 */
export function ProductTour() {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const pausedRef = useRef(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion.current) return;
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      setActive(a => {
        const next = (a + 1) % FRAMES.length;
        if (next === 0) setCycle(c => c + 1);
        return next;
      });
    }, FRAME_MS);
    return () => clearInterval(interval);
  }, []);

  const Visual = VISUALS[active];

  return (
    <div
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
    >
      <div className="grid sm:grid-cols-2">
        <div className="p-7 sm:p-8 flex flex-col justify-center order-2 sm:order-1">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Step {active + 1} of {FRAMES.length}</p>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">{FRAMES[active].title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{FRAMES[active].body}</p>
          <div className="flex gap-1.5">
            {FRAMES.map((f, i) => (
              <button key={f.title} type="button" aria-label={`Show step ${i + 1}: ${f.title}`}
                onClick={() => { setActive(i); pausedRef.current = true; }}
                className="group py-2 flex-1 max-w-[40px]">
                <span className={`block h-1 rounded-full transition-colors ${i === active ? 'bg-teal-500' : 'bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600'}`} />
              </button>
            ))}
          </div>
        </div>
        <div key={`${active}-${cycle}`} className="p-7 sm:p-8 bg-gray-50 dark:bg-gray-800/40 flex items-center justify-center order-1 sm:order-2 min-h-[180px]">
          <Visual />
        </div>
      </div>
    </div>
  );
}
