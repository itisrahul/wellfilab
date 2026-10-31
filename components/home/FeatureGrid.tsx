'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatedRing } from './AnimatedRing';
import { AnimatedTrendChart } from './AnimatedTrendChart';
import { CountUp } from './CountUp';
import { Reveal } from './Reveal';

const RINGS = [
  { label: 'Body', score: 82, color: '#0D9488' },
  { label: 'Mind', score: 53, color: '#8B5CF6' },
  { label: 'Wealth', score: 60, color: '#D97706' },
  { label: 'Life', score: 71, color: '#16A34A' },
];

function ScoreTileVisual() {
  return (
    <div className="flex items-center gap-6">
      <AnimatedRing pct={67} color="#0D9488" size={88} thick={8} />
      <div className="grid grid-cols-2 gap-x-5 gap-y-2">
        {RINGS.map(r => (
          <div key={r.label} className="flex items-center gap-1.5 text-[13px]">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
            <span className="text-gray-500 dark:text-gray-400">{r.label}</span>
            <span className="font-mono tabular-nums font-bold text-gray-900 dark:text-white ml-auto">{r.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Re-plays its fill every time it scrolls into view, same as AnimatedRing. */
function GoalBar({ label, pct, note, delayMs }: { label: string; pct: number; note: string; delayMs: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setWidth(pct); return; }
    const el = ref.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { t = setTimeout(() => setWidth(pct), delayMs); }
      else { clearTimeout(t); setWidth(0); }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => { clearTimeout(t); observer.disconnect(); };
  }, [pct, delayMs]);
  return (
    <div ref={ref}>
      <div className="flex justify-between text-[13px] mb-1.5">
        <span className="font-semibold text-gray-700 dark:text-gray-300">{label}</span>
        <span className="font-mono tabular-nums text-gray-400">{note}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${width}%`, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}

function GoalTileVisual() {
  return (
    <div className="grid gap-4 w-full">
      <GoalBar label="Net worth" pct={45} note="₹90.5L of ₹2Cr" delayMs={100} />
      <GoalBar label="Emergency fund" pct={63} note="63%" delayMs={300} />
    </div>
  );
}

/** Ticks its checklist off every time it scrolls into view. */
function RoadmapTileVisual() {
  const items = ['Build a 3-month emergency fund', 'Sleep 7+ hours nightly', 'Start a ₹5,000 SIP'];
  const [checked, setChecked] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setChecked(items.length); return; }
    const el = ref.current;
    if (!el) return;
    let timers: ReturnType<typeof setTimeout>[] = [];
    const observer = new IntersectionObserver(([entry]) => {
      timers.forEach(clearTimeout);
      if (entry.isIntersecting) {
        timers = items.map((_, i) => setTimeout(() => setChecked(i), 300 + i * 550));
      } else {
        setChecked(-1);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => { timers.forEach(clearTimeout); observer.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div ref={ref} className="grid gap-3 w-full">
      {items.map((label, i) => (
        <div key={label} className="flex items-center gap-3">
          <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors duration-300 ${checked >= i ? 'bg-teal-500 border-teal-500' : 'border-gray-300 dark:border-gray-600'}`}>
            {checked >= i && <svg viewBox="0 0 12 12" className="w-3 h-3"><path d="M2 6l2.5 2.5L10 3" stroke="white" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </span>
          <span className={`text-sm transition-colors duration-300 ${checked >= i ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300 font-medium'}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function MiniPreview({ rows, accent }: { rows: { label: string; value: string }[]; accent: string }) {
  return (
    <dl className="grid grid-cols-2 gap-x-5 gap-y-2 text-sm">
      {rows.map(r => (
        <div key={r.label} className="flex justify-between gap-2">
          <dt className="text-gray-400">{r.label}</dt>
          <dd className={`font-mono tabular-nums font-bold ${accent}`}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Tile({ href, eyebrow, eyebrowColor, title, body, visual }: {
  href: string; eyebrow: string; eyebrowColor: string; title: string; body: string; visual: React.ReactNode;
}) {
  return (
    <Link href={href}
      className="group relative flex flex-col justify-between rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-7 transition-all hover:border-gray-200 dark:hover:border-gray-700 hover:-translate-y-1 hover:shadow-[0_16px_40px_-16px_rgba(15,23,42,0.2)] dark:hover:shadow-none">
      <div>
        <p className={`text-xs font-bold uppercase tracking-widest mb-2.5 ${eyebrowColor}`}>{eyebrow}</p>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-[15px] text-gray-500 dark:text-gray-400 leading-relaxed mb-6 max-w-md">{body}</p>
      </div>
      <div className="mt-auto">{visual}</div>
      <span className="absolute top-7 right-7 text-gray-300 dark:text-gray-600 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all text-base font-bold">→</span>
    </Link>
  );
}

function StatTile({ href, value, label, body }: { href: string; value: React.ReactNode; label: string; body: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-7 transition-all hover:border-gray-200 dark:hover:border-gray-700 hover:-translate-y-1 hover:shadow-[0_16px_40px_-16px_rgba(15,23,42,0.2)] dark:hover:shadow-none">
      <p className="text-3xl font-black tracking-tight text-gray-900 dark:text-white tabular-nums">{value}</p>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1.5">{label}</p>
      <p className="text-[13px] text-gray-400 mt-1.5 leading-relaxed">{body}</p>
    </Link>
  );
}

const CURRENCY_FLAGS = ['🇮🇳', '🇺🇸', '🇪🇺', '🇬🇧', '🇯🇵', '🇦🇪'];

/**
 * The homepage's "here's everything you actually get" section — one card
 * per real feature, each with a live scroll-triggered visual instead of a
 * stock icon, so the claim is demonstrated, not just stated. Health and
 * finance calculators sit in the same grid as Score/Goals/Roadmap/
 * Dashboard rather than in a separate section further down — this is
 * meant to be the one place that shows the whole product at a glance,
 * calculators included, not a dashboard-only preview.
 */
export function FeatureGrid({ healthPreview, financePreview, guideCount, calcCount }: {
  healthPreview: { label: string; value: string }[];
  financePreview: { label: string; value: string }[];
  guideCount: number;
  calcCount: number;
}) {
  return (
    <div className="grid gap-5">
      <div className="grid lg:grid-cols-3 gap-5">
        <Reveal as="div">
          <Tile href="/score" eyebrow="WellFiLab Score" eyebrowColor="text-teal-700 dark:text-teal-400" title="One score for everything"
            body="Body, mind, wealth and life — one real number, recalculated every time you check in."
            visual={<ScoreTileVisual />} />
        </Reveal>
        <Reveal as="div" delayMs={70}>
          <Tile href="/goals" eyebrow="Goals & Net Worth" eyebrowColor="text-amber-700 dark:text-amber-400" title="Goals that track themselves"
            body="20 goal types. Net worth updates itself from the real holdings you add — never a manual snapshot."
            visual={<GoalTileVisual />} />
        </Reveal>
        <Reveal as="div" delayMs={140}>
          <Tile href="/roadmap" eyebrow="Roadmap" eyebrowColor="text-teal-700 dark:text-teal-400" title="A plan, not a list"
            body="Your weakest areas become a phased roadmap. Step 2 only unlocks after step 1."
            visual={<RoadmapTileVisual />} />
        </Reveal>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Reveal as="div" delayMs={70}>
          <Tile href="/dashboard" eyebrow="Dashboard" eyebrowColor="text-amber-700 dark:text-amber-400" title="Everything, in one place"
            body="Score, roadmap, goals and net worth together — not five different apps and a spreadsheet."
            visual={<div className="pt-1"><AnimatedTrendChart /></div>} />
        </Reveal>
        <Reveal as="div" delayMs={140}>
          <Tile href="/tools/health" eyebrow="Health calculators" eyebrowColor="text-teal-700 dark:text-teal-400" title="BMI, sleep, calories, body fat"
            body="Understand your body with real numbers, not guesswork."
            visual={<MiniPreview rows={healthPreview} accent="text-teal-700 dark:text-teal-400" />} />
        </Reveal>
        <Reveal as="div" delayMs={210}>
          <Tile href="/tools/finance" eyebrow="Finance calculators" eyebrowColor="text-amber-700 dark:text-amber-400" title="SIP, EMI, FIRE, retirement"
            body="Make smarter money decisions with tools built for real numbers."
            visual={<MiniPreview rows={financePreview} accent="text-amber-700 dark:text-amber-400" />} />
        </Reveal>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Reveal as="div" delayMs={60}>
          <StatTile href="/tools" value={<CountUp value={calcCount} suffix="+" />} label="Calculators"
            body="Health and finance, in one place." />
        </Reveal>
        <Reveal as="div" delayMs={120}>
          <StatTile href="/guides" value={<CountUp value={guideCount} />} label="Guides"
            body="The math behind every calculator, explained." />
        </Reveal>
        <Reveal as="div" delayMs={180}>
          <StatTile href="/tools/finance/currency" value={<CountUp value={15} />} label="Currencies"
            body={`See every number in yours — ${CURRENCY_FLAGS.join(' ')}`} />
        </Reveal>
        <Reveal as="div" delayMs={240}>
          <StatTile href="/tools" value="🔒" label="Private by default"
            body="Runs in your browser, instantly. Sign in only if you want history saved." />
        </Reveal>
      </div>
    </div>
  );
}
