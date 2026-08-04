'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { calculateBodyScore, scoreColor, scoreLabel, type BodyInputs, type QuickInputs } from '@/lib/wellfilab-score';
import { ScoreRing } from '@/components/ui/ScoreRing';

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
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</label>
        <span className="font-mono tabular-nums text-xs font-bold text-gray-900 dark:text-white">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-px rounded-none bg-gray-300 dark:bg-gray-700 accent-teal-600 cursor-pointer"
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
  const color = scoreColor(score.overall);
  const insight = score.insights[0]?.headline ?? 'Adjust the sliders — every real habit here moves the score.';

  return (
    <div className="border-y border-gray-200 dark:border-gray-800 py-8">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-6">Try it — this is really calculating, live</p>

      <div className="grid md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center">
        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          <Slider label="Sleep" value={sleepHours} min={4} max={10} step={0.5} unit="h" onChange={setSleepHours} />
          <Slider label="Exercise / week" value={exerciseDays} min={0} max={7} step={1} unit=" days" onChange={setExerciseDays} />
          <Slider label="Stress" value={stressLevel} min={1} max={10} step={1} unit="/10" onChange={setStressLevel} />
        </div>

        <div className="flex items-center gap-4 md:border-l md:border-gray-200 md:dark:border-gray-800 md:pl-8">
          <div className="relative flex-shrink-0" style={{ width: 72, height: 72 }}>
            <ScoreRing pct={score.overall} color={color} size={72} thick={5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono tabular-nums font-black text-2xl" style={{ color }}>{score.overall}</span>
            </div>
          </div>
          <div className="min-w-0 max-w-[13rem]">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{scoreLabel(score.overall)} · Health Score</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug mt-0.5">{insight}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-900">
        <p className="text-[11px] text-gray-400 max-w-md">Using typical defaults for diet, weight & hydration — the full score uses your real numbers for everything.</p>
        <Link href="/score" className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
          Get my full health + wealth score →
        </Link>
      </div>
    </div>
  );
}
