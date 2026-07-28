'use client';
import { LayoutGrid, Heart, Wallet, Target, Map as MapIcon, Bell } from 'lucide-react';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { scoreColor } from '@/lib/wellfilab-score';

/**
 * Device-mockup hero visual — laptop + phone frames showing our real
 * dashboard structure (score ring, health/wealth split, sidebar nav) with
 * a couple of floating stat cards, in the spirit of a reference composite
 * the user shared. Every number here is the SAME illustrative sample used
 * elsewhere on this page (overall 61, body 68 / mind 60 / wealth 54 /
 * life 61) — one consistent example across the homepage, not fabricated
 * per-section. Clearly marked "Sample" since no visitor has taken the
 * score yet.
 */
const SCORE = { overall: 61, body: 68, mind: 60, wealth: 54, life: 61 };
const HEALTH_TREND = [58, 64, 69, 75, 81];
const WEALTH_TREND = [50, 54, 58, 60, 61];

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${100 - ((v - min) / (max - min || 1)) * 100}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      <polyline points={points} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function HeroShowcase() {
  const ringColor = scoreColor(SCORE.overall);
  return (
    <div className="relative mx-auto max-w-xl" style={{ minHeight: 420 }}>

      {/* ── Laptop frame — the dominant visual ── */}
      <div className="relative mx-auto w-full max-w-md">
        <div className="rounded-t-2xl border-[10px] border-b-0 border-gray-900 dark:border-gray-800 bg-gray-900 dark:bg-gray-800 shadow-2xl overflow-hidden">
          <div className="bg-white dark:bg-gray-950 aspect-[16/10.5] flex text-left">
            {/* sidebar */}
            <div className="w-9 sm:w-11 bg-gray-50 dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col items-center gap-3 py-3 flex-shrink-0">
              {[LayoutGrid, Heart, Wallet, Target, MapIcon].map((Icon, i) => (
                <Icon key={i} size={13} className={i === 0 ? 'text-teal-600 dark:text-teal-400' : 'text-gray-300 dark:text-gray-700'} />
              ))}
            </div>
            {/* main */}
            <div className="flex-1 min-w-0 p-2.5 sm:p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-black text-[10px] sm:text-xs text-gray-900 dark:text-white tracking-tight">WELLFILAB</span>
                <Bell size={11} className="text-gray-300 dark:text-gray-700" />
              </div>
              <p className="text-[7px] sm:text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Your WellFiLab Score</p>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="relative flex-shrink-0" style={{ width: 46, height: 46 }}>
                  <ScoreRing pct={SCORE.overall} color={ringColor} size={46} thick={5} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono tabular-nums font-black text-[13px]" style={{ color: ringColor }}>{SCORE.overall}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 flex-1 min-w-0">
                  {[
                    { l: 'Body', v: SCORE.body, c: '#0d9488' },
                    { l: 'Mind', v: SCORE.mind, c: '#6366f1' },
                    { l: 'Wealth', v: SCORE.wealth, c: '#f59e0b' },
                    { l: 'Life', v: SCORE.life, c: '#22c55e' },
                  ].map(d => (
                    <div key={d.l} className="bg-gray-50 dark:bg-gray-900 rounded px-1 py-0.5">
                      <p className="text-[6px] text-gray-400 leading-none mb-0.5">{d.l}</p>
                      <p className="font-mono tabular-nums font-bold text-[8px] leading-none" style={{ color: d.c }}>{d.v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-1">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '29%' }} />
              </div>
              <p className="text-[6px] sm:text-[7px] text-gray-400">Roadmap · Phase 1 · 29% complete</p>
            </div>
          </div>
        </div>
        {/* laptop base */}
        <div className="h-2.5 sm:h-3 mx-3 rounded-b-xl bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800" />
        <div className="h-1 w-1/3 mx-auto rounded-b-lg bg-gray-400 dark:bg-gray-700" />
      </div>

      {/* ── Floating card — Net Worth (top right) ── */}
      <div className="hidden sm:block absolute -top-5 -right-2 lg:right-2 w-36 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl p-3 rotate-2">
        <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">Net Worth · Sample</p>
        <p className="font-mono tabular-nums font-black text-sm text-gray-900 dark:text-white mb-1">₹18.4L <span className="text-emerald-500 text-[9px] font-bold">+12%</span></p>
        <div className="h-6"><Sparkline values={[12, 13.5, 14, 16, 18.4]} color="#f59e0b" /></div>
      </div>

      {/* ── Floating card — Health vs Wealth trend (left) ── */}
      <div className="hidden sm:block absolute top-1/3 -left-4 lg:-left-8 w-32 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl p-3 -rotate-2">
        <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">Trend · Sample</p>
        <div className="h-8 flex gap-1.5">
          <div className="flex-1"><Sparkline values={HEALTH_TREND} color="#0d9488" /></div>
          <div className="flex-1"><Sparkline values={WEALTH_TREND} color="#f59e0b" /></div>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="flex items-center gap-1 text-[7px] text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-teal-500" />Health</span>
          <span className="flex items-center gap-1 text-[7px] text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Wealth</span>
        </div>
      </div>

      {/* ── Phone mockup (bottom, peeking out) ── */}
      <div className="hidden sm:block absolute -bottom-6 left-16 lg:left-20 w-16 z-10">
        <div className="rounded-2xl border-4 border-gray-900 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xl aspect-[9/17.5] flex flex-col items-center justify-center gap-1">
          <div className="relative" style={{ width: 30, height: 30 }}>
            <ScoreRing pct={SCORE.overall} color={ringColor} size={30} thick={3.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono tabular-nums font-black text-[9px]" style={{ color: ringColor }}>{SCORE.overall}</span>
            </div>
          </div>
          <p className="text-[5px] font-bold uppercase tracking-widest text-gray-400">Score</p>
        </div>
      </div>

      {/* ── Real photo accent, bottom-left — drop your file at
           public/images/hero.jpg (square-ish crop, 600px+) and it appears
           here automatically. ── */}
      <div className="hidden lg:block absolute -bottom-8 -left-10 w-24 h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-900 shadow-xl bg-gray-200 dark:bg-gray-800">
        <img src="/images/hero.jpg" alt="A WellFiLab member" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
