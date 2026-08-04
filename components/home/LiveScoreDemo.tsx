'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { calculateBodyScore, scoreColor, scoreLabel, type BodyInputs, type QuickInputs } from '@/lib/wellfilab-score';
import { ScoreRing } from '@/components/ui/ScoreRing';

/** Smoothly eases the displayed number toward a new target whenever it
 * changes, instead of snapping — so dragging a slider feels like it's
 * actually driving a live calculation, not just swapping static text. */
function useAnimatedNumber(target: number, duration = 400): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

// Sensible medians for the fields this 3-question demo doesn't ask about —
// same fallback pattern the real /score flow uses for its own live preview
// (see PREVIEW_FALLBACK in app/score/page.tsx), not invented for this widget.
const DEFAULTS: Omit<BodyInputs, 'sleepHours' | 'exerciseDays' | 'stressLevel'> = {
  age: 28, weight: 70, height: 170, dietQuality: 3, waterLiters: 2.5,
};
const DUMMY_QUICK: QuickInputs = { healthFeeling: 3, financeFeeling: 3, stressFeeling: 3 };

function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-white/60">{label}</label>
        <span className="font-mono tabular-nums text-xs font-bold text-teal-300">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full bg-white/10 accent-teal-400 cursor-pointer"
      />
    </div>
  );
}

/**
 * The homepage's interactive centerpiece — a real, working 3-question
 * version of the actual scoring engine (calculateBodyScore), not a
 * screenshot or a mockup with invented numbers. A visitor experiences the
 * product by using it, in about 15 seconds, before ever clicking through.
 * Health-only (no income question) deliberately — asking money questions
 * before someone has decided to trust the site is unnecessary friction,
 * and the full health+wealth score is one click away once they're hooked.
 */
export function LiveScoreDemo() {
  const [sleepHours, setSleepHours] = useState(7);
  const [exerciseDays, setExerciseDays] = useState(3);
  const [stressLevel, setStressLevel] = useState(5);

  const score = useMemo(
    () => calculateBodyScore(DUMMY_QUICK, { ...DEFAULTS, sleepHours, exerciseDays, stressLevel }, []),
    [sleepHours, exerciseDays, stressLevel]
  );
  const animatedOverall = useAnimatedNumber(score.overall);
  const color = scoreColor(score.overall);
  const insight = score.insights[0]?.headline ?? 'Adjust the sliders — every real habit here moves the score.';

  return (
    <div className="relative">
      {/* Glow behind the glass panel */}
      <div className="absolute -inset-6 bg-gradient-to-br from-teal-500/30 via-cyan-500/10 to-transparent rounded-[2rem] blur-2xl pointer-events-none" />

      <div className="relative bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-7">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-300 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          Live — this is really calculating
        </p>

        <div className="space-y-4 mb-6">
          <Slider label="Sleep, typical night" value={sleepHours} min={4} max={10} step={0.5} unit="h" onChange={setSleepHours} />
          <Slider label="Exercise days per week" value={exerciseDays} min={0} max={7} step={1} unit="" onChange={setExerciseDays} />
          <Slider label="Stress level" value={stressLevel} min={1} max={10} step={1} unit="/10" onChange={setStressLevel} />
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
          <div className="relative flex-shrink-0" style={{ width: 64, height: 64, filter: `drop-shadow(0 0 10px ${color}80)` }}>
            <ScoreRing pct={animatedOverall} color={color} size={64} thick={6} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono tabular-nums font-black text-xl" style={{ color }}>{animatedOverall}</span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">{scoreLabel(score.overall)} · Health Score</p>
            <p className="text-xs text-white/50 leading-snug mt-0.5">{insight}</p>
          </div>
        </div>

        <p className="text-[11px] text-white/40 mt-3">Using typical defaults for diet, weight & hydration — the full score uses your real numbers for everything.</p>

        <Link href="/score" className="mt-4 flex items-center justify-center gap-2 w-full px-5 py-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm shadow-[0_0_24px_-4px_rgba(45,212,191,0.6)] hover:shadow-[0_0_32px_-4px_rgba(45,212,191,0.8)] transition-all">
          Get my full health + wealth score →
        </Link>
      </div>
    </div>
  );
}
