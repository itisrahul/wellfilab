'use client';
import { useState } from 'react';
import Link from 'next/link';
import { calculateLifeROI, type LifeROIInputs, type LifeROIResult } from '@/lib/lifeROI';
import { scoreLabel, scoreColor } from '@/lib/dashboardData';
import { Shell, MoneyIn, NumIn, Box } from '@/components/tools/shared';
import { ScoreRing } from '@/components/ui/ScoreRing';

const HISTORY_KEY = 'wfl_life_roi_history';

const saveLifeROI = (result: LifeROIResult) => {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    history.unshift({
      date: new Date().toISOString(),
      healthScore: result.healthScore,
      financeScore: result.financeScore,
      lifeROIScore: result.lifeROIScore,
      insights: result.insights,
      topActions: result.topActions,
      projections: result.projections,
      lifeImpact: result.lifeImpact,
      healthCostOfMoney: result.healthCostOfMoney,
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
  } catch { /* private browsing / quota — history is a nice-to-have, never block the result */ }
};

const DEFAULTS: LifeROIInputs = {
  age: 30,
  monthlyIncome: 80000,
  monthlyExpenses: 55000,
  monthlySavings: 15000,
  sleepHours: 7,
  exerciseDaysPerWeek: 2,
  stressLevel: 3,
  smokes: false,
  drinksRegularly: false,
};

const PRIORITY_COLOR: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  High:     'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
  Medium:   'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
};

export default function LifeROIPage() {
  const [inputs, setInputs] = useState<LifeROIInputs>(DEFAULTS);
  const [result, setResult] = useState<LifeROIResult | null>(null);

  const set = <K extends keyof LifeROIInputs>(key: K, value: LifeROIInputs[K]) =>
    setInputs(prev => ({ ...prev, [key]: value }));

  const calculate = () => {
    const r = calculateLifeROI(inputs);
    setResult(r);
    saveLifeROI(r);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Life ROI</p>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">What's the real return on your habits?</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            A handful of health and money numbers, one combined score, and specific actions ranked by impact.
          </p>
        </div>

        {result && (
          <div className="space-y-6 mb-10">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { label: 'Health Score',  value: result.healthScore },
                  { label: 'Life ROI Score', value: result.lifeROIScore },
                  { label: 'Finance Score', value: result.financeScore },
                ].map(s => (
                  <div key={s.label} className="flex flex-col items-center">
                    <div className="relative">
                      <ScoreRing pct={s.value} color={scoreColor(s.value)} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</span>
                        <span className="text-[10px] text-gray-400">/100</span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-3">{s.label}</p>
                    <p className="text-xs font-semibold" style={{ color: scoreColor(s.value) }}>{scoreLabel(s.value)}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-center mt-6 max-w-lg mx-auto">{result.lifeImpact}</p>
            </div>

            {result.healthCostOfMoney > 0 && (
              <Box icon="💰 Estimated cost of current health habits"
                text={`Roughly ₹${result.healthCostOfMoney.toLocaleString('en-IN')}/year in lost productivity and likely extra medical spend — the actions below target this directly.`}
                color="orange" />
            )}

            <div>
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">Top actions, ranked</h2>
              <div className="space-y-3">
                {result.topActions.map((a, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[a.priority]}`}>{a.priority}</span>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{a.title}</p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{a.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                      {a.financialImpact != null && <span>💰 Save ₹{a.financialImpact.toLocaleString('en-IN')}/yr</span>}
                      {a.healthImpact && <span>❤️ {a.healthImpact}</span>}
                      {a.timeToResult && <span>⏱ {a.timeToResult}</span>}
                    </div>
                    {a.toolLink && (
                      <Link href={a.toolLink.url} className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline mt-3">
                        Try {a.toolLink.label} →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">Insights</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {result.insights.map((ins, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">{ins.emoji}</span>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{ins.title}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{ins.description}</p>
                    {ins.financialValue != null && ins.financialValue > 0 && (
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2">₹{ins.financialValue.toLocaleString('en-IN')}/yr</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">If your current surplus keeps investing</h2>
              <div className="grid grid-cols-3 gap-3">
                {result.projections.map(p => (
                  <div key={p.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">{p.label}</p>
                    <p className="text-lg font-black text-teal-600 dark:text-teal-400">₹{Math.round(p.netWorthDelta).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Link href="/dashboard" className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-all">
                View on Dashboard →
              </Link>
              <button onClick={() => setResult(null)}
                className="px-5 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-bold hover:border-teal-400 transition-all">
                Recalculate
              </button>
            </div>
          </div>
        )}

        {!result && (
          <Shell
            left={<>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">About you</p>
              <NumIn label="Age" value={inputs.age} onChange={v => set('age', v)} min={16} max={90} />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 mt-4">Finances (monthly)</p>
              <MoneyIn label="Income" value={inputs.monthlyIncome} onChange={v => set('monthlyIncome', v)} sym="₹" step={5000} />
              <MoneyIn label="Expenses" value={inputs.monthlyExpenses} onChange={v => set('monthlyExpenses', v)} sym="₹" step={5000} />
              <MoneyIn label="Savings / SIP" value={inputs.monthlySavings} onChange={v => set('monthlySavings', v)} sym="₹" step={1000} />
            </>}
            right={<>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Health</p>
              <NumIn label="Average sleep (hours/night)" value={inputs.sleepHours} onChange={v => set('sleepHours', v)} min={3} max={12} step={0.5} />
              <NumIn label="Exercise days per week" value={inputs.exerciseDaysPerWeek} onChange={v => set('exerciseDaysPerWeek', v)} min={0} max={7} />
              <div>
                <label className="calc-label">Stress level</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => set('stressLevel', n)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border-2 transition-all ${inputs.stressLevel === n ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-teal-400'}`}>
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">1 = very low, 5 = very high</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => set('smokes', !inputs.smokes)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${inputs.smokes ? 'bg-red-500 border-red-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500'}`}>
                  🚬 Smokes {inputs.smokes ? '✓' : ''}
                </button>
                <button onClick={() => set('drinksRegularly', !inputs.drinksRegularly)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${inputs.drinksRegularly ? 'bg-red-500 border-red-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500'}`}>
                  🍷 Drinks regularly {inputs.drinksRegularly ? '✓' : ''}
                </button>
              </div>
              <button onClick={calculate}
                className="w-full mt-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all">
                Calculate My Life ROI →
              </button>
            </>}
          />
        )}
      </div>
    </div>
  );
}
