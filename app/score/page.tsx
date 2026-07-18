'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  calculateBodyScore, calculateFullScore, scoreColor, scoreLabel, netWorthVerdict,
  type QuickInputs, type BodyInputs, type FinanceInputs, type WellFiScore,
  type Insight, type Action, type Trajectory, type Dimension,
} from '@/lib/wellfilab-score';
import { getLatestScore, getScoreHistory, saveScore } from '@/lib/scoreStorage';
import { saveRawInputs, loadRawInputs } from '@/lib/scoreInputs';
import { getSnapshots } from '@/lib/netWorthHistory';
import { buildRiskManagementPlan } from '@/lib/riskManagement';
import { SITE_URL } from '@/config/site';

// ── Fallbacks used only to compute a live PREVIEW before a field is filled ──
const PREVIEW_FALLBACK: BodyInputs = {
  age: 28, weight: 70, height: 170, sleepHours: 7, exerciseDays: 3,
  stressLevel: 5, dietQuality: 3, waterLiters: 2.5,
};
const EMPTY_FINANCE: FinanceInputs = {
  monthlyIncome: 0, monthlyExpenses: 0, totalSavings: 0, totalDebt: 0,
  monthlyInvestments: 0, hasEmergencyFund: false, hasInsurance: false,
};

function fmtINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = 0;
    const startTime = performance.now();
    let raf: number;
    function tick(now: number) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (target - start) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}

/** Same derivation formula used at both the Stage A→B transition (finance
 * unknown yet, so financeFeeling is neutral) and the final calculation. */
function deriveQuick(body: BodyInputs, savingsRate: number | null, hasEmergencyFund: boolean): QuickInputs {
  return {
    healthFeeling:
      body.sleepHours >= 7 && body.exerciseDays >= 3 ? 4 :
      body.sleepHours >= 6 && body.exerciseDays >= 1 ? 3 :
      body.sleepHours >= 5 ? 2 : 1,
    financeFeeling:
      savingsRate == null ? 3 :
      savingsRate >= 0.2 && hasEmergencyFund ? 4 :
      savingsRate >= 0.1 ? 3 :
      savingsRate >= 0 ? 2 : 1,
    stressFeeling:
      body.stressLevel <= 3 ? 4 :
      body.stressLevel <= 5 ? 3 :
      body.stressLevel <= 7 ? 2 : 1,
  };
}

type Stage = 'A' | 'transition' | 'B' | 'calculating' | 'results';

export default function ScorePage() {
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<Stage>('A');
  const [body, setBody] = useState<Partial<BodyInputs>>({});
  const [finance, setFinance] = useState<Partial<FinanceInputs>>({});
  const [score, setScore] = useState<WellFiScore | null>(null);
  const [history, setHistory] = useState<WellFiScore[]>([]);
  const [transitionSummary, setTransitionSummary] = useState<{ overall: number; body: number; mind: number } | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const wantsRetake = typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('retake') === '1';
    Promise.all([getLatestScore(), getScoreHistory()]).then(([latest, hist]) => {
      setHistory(hist);
      if (latest && !wantsRetake) {
        setScore(latest);
        const savedInputs = loadRawInputs();
        if (savedInputs) { setBody(savedInputs.body); setFinance(savedInputs.finance); }
        setStage('results');
      }
      // wantsRetake (or no prior score): stay on stage 'A' for a fresh quiz.
      // History stays loaded either way, so streak/trend still compare
      // correctly against past scores once the new one is saved.
    });
  }, []);

  // Effective body: real entries where filled, neutral fallback otherwise —
  // lets the live preview respond field-by-field without ever showing NaN.
  const effectiveBody: BodyInputs = {
    age: body.age ?? PREVIEW_FALLBACK.age,
    weight: body.weight ?? PREVIEW_FALLBACK.weight,
    height: body.height ?? PREVIEW_FALLBACK.height,
    sleepHours: body.sleepHours ?? PREVIEW_FALLBACK.sleepHours,
    exerciseDays: body.exerciseDays ?? PREVIEW_FALLBACK.exerciseDays,
    stressLevel: body.stressLevel ?? PREVIEW_FALLBACK.stressLevel,
    dietQuality: (body.dietQuality ?? PREVIEW_FALLBACK.dietQuality) as 1 | 2 | 3 | 4 | 5,
    waterLiters: body.waterLiters ?? PREVIEW_FALLBACK.waterLiters,
  };
  const debouncedBody = useDebounced(effectiveBody);

  const requiredAFilled = body.age != null && body.weight != null && body.height != null && body.sleepHours != null;
  const filledSlots = [
    body.age != null,
    body.height != null && body.weight != null,
    body.sleepHours != null,
    body.exerciseDays != null,
    body.stressLevel != null,
    body.dietQuality != null,
    body.waterLiters != null,
  ].filter(Boolean).length;
  const accuracyPct = Math.round((filledSlots / 7) * 100);

  const previewQuick = deriveQuick(debouncedBody, null, false);
  const preview = requiredAFilled ? calculateBodyScore(previewQuick, debouncedBody, []) : null;

  const bmi = effectiveBody.weight / Math.pow(effectiveBody.height / 100, 2);

  const goToFinance = () => {
    if (!requiredAFilled) return;
    const t = calculateBodyScore(previewQuick, effectiveBody, []);
    setTransitionSummary({ overall: t.overall, body: t.body, mind: t.mind });
    setStage('transition');
    setTimeout(() => { setStage('B'); setTransitionSummary(null); }, 1500);
  };

  const income = finance.monthlyIncome ?? 0;
  const expenses = finance.monthlyExpenses ?? 0;
  const savingsRate = income > 0 ? (income - expenses) / income : null;

  const calculate = async () => {
    if (!income) return;
    setStage('calculating');
    const effectiveFinance: FinanceInputs = {
      monthlyIncome: income,
      monthlyExpenses: expenses,
      totalSavings: finance.totalSavings ?? 0,
      totalDebt: finance.totalDebt ?? 0,
      monthlyInvestments: finance.monthlyInvestments ?? 0,
      hasEmergencyFund: finance.hasEmergencyFund ?? false,
      hasInsurance: finance.hasInsurance ?? false,
      hasLifeInsurance: finance.hasLifeInsurance,
      equityAllocationPct: finance.equityAllocationPct,
      riskTolerance: finance.riskTolerance,
    };
    const finalQuick = deriveQuick(effectiveBody, savingsRate, effectiveFinance.hasEmergencyFund);
    const [netWorthSnapshots] = await Promise.all([getSnapshots(), new Promise(r => setTimeout(r, 1500))]);
    const latestNetWorth = netWorthSnapshots.length > 0 ? netWorthSnapshots[netWorthSnapshots.length - 1].netWorth : null;
    const result = calculateFullScore(finalQuick, effectiveBody, effectiveFinance, history, latestNetWorth);
    const saved = await saveScore(result);
    saveRawInputs(effectiveBody, effectiveFinance);
    setFinance(effectiveFinance);
    setScore(saved);
    setHistory(prev => [saved, ...prev]);
    setStage('results');
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const retake = () => {
    setScore(null);
    setBody({});
    setFinance({});
    setStage('A');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (stage === 'transition' && transitionSummary) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Health profile complete</p>
          <p className="text-6xl font-black text-white mb-2">{transitionSummary.overall}<span className="text-2xl text-white/40">/100</span></p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div><p className="text-xl font-bold text-teal-400">{transitionSummary.body}</p><p className="text-xs text-white/40">Body</p></div>
            <div><p className="text-xl font-bold text-indigo-400">{transitionSummary.mind}</p><p className="text-xs text-white/40">Mind</p></div>
          </div>
          <p className="text-white/40 text-sm mt-8">Now let's add your financial picture…</p>
        </div>
      </div>
    );
  }

  if (stage === 'calculating') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-white font-bold">Calculating your complete picture…</p>
        </div>
      </div>
    );
  }

  if (stage === 'A') {
    return <StageA body={body} setBody={setBody} bmi={bmi} preview={preview}
      requiredFilled={requiredAFilled} filledSlots={filledSlots} accuracyPct={accuracyPct}
      onContinue={goToFinance} />;
  }

  if (stage === 'B') {
    return <StageB finance={finance} setFinance={setFinance} body={effectiveBody}
      income={income} savingsRate={savingsRate}
      previewHealthScore={preview?.overall ?? null}
      onCalculate={calculate} />;
  }

  // stage === 'results'
  if (!score) return null;
  return (
    <div ref={resultsRef}>
      <Results score={score} body={body} finance={finance} history={history} onRetake={retake} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// STAGE A — Health inputs
// ════════════════════════════════════════════════════════════════════════

function StageA({ body, setBody, bmi, preview, requiredFilled, filledSlots, accuracyPct, onContinue }: {
  body: Partial<BodyInputs>; setBody: React.Dispatch<React.SetStateAction<Partial<BodyInputs>>>;
  bmi: number; preview: WellFiScore | null;
  requiredFilled: boolean; filledSlots: number; accuracyPct: number;
  onContinue: () => void;
}) {
  const [bmiNoteOpen, setBmiNoteOpen] = useState(false);
  const bmiStatus = bmi < 18.5 ? { label: 'Below healthy range', color: 'text-amber-600 dark:text-amber-400' }
    : bmi <= 25 ? { label: 'Healthy range ✓', color: 'text-green-600 dark:text-green-400' }
    : bmi <= 30 ? { label: 'Slightly above range', color: 'text-amber-600 dark:text-amber-400' }
    : { label: 'Above healthy range', color: 'text-red-600 dark:text-red-400' };

  const set = <K extends keyof BodyInputs>(key: K, value: BodyInputs[K]) => setBody(b => ({ ...b, [key]: value }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Your Health Profile</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real numbers only — your score is calculated from your actual data.</p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400 flex-shrink-0">Step 1 of 2</span>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left 60% — form */}
          <div className="lg:col-span-3 space-y-6">

            <FieldSection title="About You">
              <NumberField label="Age (years)" value={body.age} onChange={v => set('age', v)} min={16} max={80} />
            </FieldSection>

            <FieldSection title="Body">
              <div className="grid grid-cols-2 gap-4">
                <NumberField label="Height (cm)" value={body.height} onChange={v => set('height', v)} min={120} max={220} />
                <NumberField label="Weight (kg)" value={body.weight} onChange={v => set('weight', v)} min={30} max={200} />
              </div>
              {body.height != null && body.weight != null && (
                <div className="mt-3">
                  <p className={`text-sm font-bold ${bmiStatus.color}`}>BMI: {bmi.toFixed(1)} — {bmiStatus.label}</p>
                  <button onClick={() => setBmiNoteOpen(o => !o)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-1">
                    How BMI affects your score {bmiNoteOpen ? '▲' : '▼'}
                  </button>
                  {bmiNoteOpen && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      BMI outside 18.5–25 adds an estimated ₹12,000–35,000/year in medical costs.
                    </p>
                  )}
                </div>
              )}
            </FieldSection>

            <FieldSection title="Sleep">
              <SliderRow label="Hours of sleep per night (be honest)" value={body.sleepHours ?? 7} min={4} max={10} step={0.5}
                display={v => `${v.toFixed(1)} hours`} onChange={v => set('sleepHours', v)} />
              {body.sleepHours != null && (
                body.sleepHours < 7.5 ? (
                  <div className={`mt-3 p-3 rounded-lg text-xs ${body.sleepHours < 6 ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'}`}>
                    <p className="font-bold mb-1">Deficit: {(7.5 - body.sleepHours).toFixed(1)} hours/night = {Math.round((7.5 - body.sleepHours) * 365)} hours/year</p>
                    <p>At your income (Step 2 will calculate): this costs approx {((7.5 - body.sleepHours) * 2.4).toFixed(1)}% of your annual productivity. Exact ₹ shown next step.</p>
                  </div>
                ) : (
                  <div className="mt-3 p-3 rounded-lg text-xs bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 font-semibold">
                    Optimal sleep ✓ Ahead of 60% of people.
                  </div>
                )
              )}
            </FieldSection>

            <FieldSection title="Movement">
              <p className="calc-label">Days per week you move intentionally (walk, gym, sport, yoga — anything)</p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-3">
                {[0, 1, 2, 3, 4, 5, 6, 7].map(d => (
                  <button key={d} onClick={() => set('exerciseDays', d)}
                    className={`py-2.5 rounded-lg text-sm font-bold border-2 transition-all ${
                      body.exerciseDays === d ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-teal-400'
                    }`}>{d}</button>
                ))}
              </div>
              {body.exerciseDays != null && (
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p className="font-semibold">
                    {body.exerciseDays === 0 ? 'Sedentary — highest health cost'
                      : body.exerciseDays <= 2 ? 'Below recommended (target: 3)'
                      : body.exerciseDays <= 4 ? 'Meets recommended minimum ✓'
                      : 'Active — top tier'}
                  </p>
                  <p>Exercise saves approx ₹12,000–24,000/year in medical costs.</p>
                </div>
              )}
            </FieldSection>

            <FieldSection title="Stress">
              <p className="calc-label">Your average stress level</p>
              <SliderRow value={body.stressLevel ?? 5} min={1} max={10} step={1}
                display={v => `${v}/10`} onChange={v => set('stressLevel', v)}
                trackColor={body.stressLevel == null ? undefined : body.stressLevel <= 4 ? '#22c55e' : body.stressLevel <= 6 ? '#f59e0b' : '#ef4444'} />
              <p className="text-[11px] text-gray-400 mt-1">1-3 Low · 4-6 Moderate · 7-8 High · 9-10 Severe</p>
              {body.stressLevel != null && body.stressLevel > 6 && (
                <div className="mt-3 p-3 rounded-lg text-xs bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400">
                  High stress reduces cognitive output by 15–18% — direct financial impact calculated with your income in Step 2.
                </div>
              )}
            </FieldSection>

            <FieldSection title="Diet Quality">
              <p className="calc-label">How would you honestly rate your diet?</p>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { v: 1, emoji: '🍕', label: 'Poor' },
                  { v: 2, emoji: '🥪', label: 'Below avg' },
                  { v: 3, emoji: '🍽', label: 'Average' },
                  { v: 4, emoji: '🥗', label: 'Good' },
                  { v: 5, emoji: '🥦', label: 'Excellent' },
                ].map(opt => (
                  <button key={opt.v} onClick={() => set('dietQuality', opt.v as 1 | 2 | 3 | 4 | 5)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl text-[11px] font-bold border-2 transition-all ${
                      body.dietQuality === opt.v ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-teal-400'
                    }`}>
                    <span className="text-xl">{opt.emoji}</span>{opt.label}
                  </button>
                ))}
              </div>
            </FieldSection>

            <FieldSection title="Hydration">
              <SliderRow label="Water intake per day" value={body.waterLiters ?? 2.5} min={0.5} max={4} step={0.25}
                display={v => `${v.toFixed(2)} litres`} onChange={v => set('waterLiters', v)} />
              {body.weight != null && (
                <p className="text-xs text-gray-400 mt-1">For your weight ({body.weight}kg): {(body.weight * 0.033).toFixed(1)}L recommended</p>
              )}
            </FieldSection>

            <div className="pt-2">
              <p className="text-xs text-gray-400 mb-3">Fields filled: {filledSlots}/7 · Accuracy: {accuracyPct}%</p>
              <button onClick={onContinue} disabled={!requiredFilled}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${
                  requiredFilled ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                }`}>
                Continue to finances →
              </button>
              {!requiredFilled && <p className="text-[11px] text-gray-400 mt-2 text-center">Age, height, weight and sleep are required to continue.</p>}
            </div>
          </div>

          {/* Right 40% — sticky live preview */}
          <div className="lg:col-span-2 lg:sticky lg:top-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
              {!preview ? (
                <>
                  <p className="text-5xl font-black text-gray-300 dark:text-gray-700 mb-2">--</p>
                  <p className="text-sm text-gray-400">Fill your details to calculate</p>
                </>
              ) : (
                <>
                  <p className="text-5xl font-black" style={{ color: scoreColor(preview.overall) }}>{preview.overall}</p>
                  <p className="text-xs text-gray-400 mb-5">out of 100 · health preview</p>
                  <div className="space-y-3 text-left">
                    <PreviewBar label="Body" value={preview.body} color="bg-teal-500" />
                    <PreviewBar label="Mind" value={preview.mind} color="bg-indigo-500" />
                  </div>
                </>
              )}
              <p className="text-xs text-gray-400 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">Accuracy: {accuracyPct}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// STAGE B — Finance inputs
// ════════════════════════════════════════════════════════════════════════

function StageB({ finance, setFinance, body, income, savingsRate, previewHealthScore, onCalculate }: {
  finance: Partial<FinanceInputs>; setFinance: React.Dispatch<React.SetStateAction<Partial<FinanceInputs>>>;
  body: BodyInputs; income: number; savingsRate: number | null;
  previewHealthScore: number | null;
  onCalculate: () => void;
}) {
  const set = <K extends keyof FinanceInputs>(key: K, value: FinanceInputs[K]) => setFinance(f => ({ ...f, [key]: value }));
  const annualIncome = income * 12;
  const investRate = income > 0 ? (finance.monthlyInvestments ?? 0) / income : 0;
  const debtToIncome = annualIncome > 0 ? (finance.totalDebt ?? 0) / annualIncome : 0;

  const savingsStyle = savingsRate == null ? null
    : savingsRate < 0 ? { label: 'Spending more than earning', color: 'text-red-600 dark:text-red-400' }
    : savingsRate < 0.1 ? { label: 'Below minimum', color: 'text-red-600 dark:text-red-400' }
    : savingsRate < 0.2 ? { label: 'Average', color: 'text-amber-600 dark:text-amber-400' }
    : savingsRate < 0.3 ? { label: 'Good', color: 'text-teal-600 dark:text-teal-400' }
    : { label: 'Excellent ✓', color: 'text-green-600 dark:text-green-400' };

  const debtStyle = (finance.totalDebt ?? 0) === 0 ? { label: 'Debt free ✓', color: 'text-green-600 dark:text-green-400' }
    : debtToIncome < 1 ? { label: 'Manageable', color: 'text-teal-600 dark:text-teal-400' }
    : debtToIncome <= 3 ? { label: 'Worth addressing', color: 'text-amber-600 dark:text-amber-400' }
    : { label: 'High — priority to reduce', color: 'text-red-600 dark:text-red-400' };

  const sipFV = (monthly: number) => Math.round(monthly * 12 * ((Math.pow(1.12, 20) - 1) / 0.12));
  const hypotheticalSip = income * 0.05;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Your Financial Picture</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This is where the health-wealth connection becomes visible. Your income determines the real cost of your habits.</p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400 flex-shrink-0">Step 2 of 2</span>
        </div>

        {previewHealthScore != null && (
          <div className="mb-8 px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
            Health score: <span className="font-bold text-gray-900 dark:text-white">{previewHealthScore}/100</span> — adding finance data completes your full picture.
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left 60% */}
          <div className="lg:col-span-3 space-y-6">

            <FieldSection title="Income">
              <NumberField label="Monthly take-home income (after tax — what you actually receive)" value={finance.monthlyIncome}
                onChange={v => set('monthlyIncome', v)} min={0} max={5000000} prefix="₹" />
              {income > 0 && <p className="text-xs text-gray-400 mt-1">= ₹{annualIncome.toLocaleString('en-IN')} per year</p>}
            </FieldSection>

            <FieldSection title="Expenses">
              <NumberField label="Monthly expenses (rent, food, travel, EMIs — everything)" value={finance.monthlyExpenses}
                onChange={v => set('monthlyExpenses', v)} min={0} max={5000000} prefix="₹" />
              {savingsStyle && (
                <p className={`text-sm font-bold mt-1 ${savingsStyle.color}`}>{Math.round((savingsRate ?? 0) * 100)}% of income saved — {savingsStyle.label}</p>
              )}
            </FieldSection>

            <FieldSection title="Savings & Investment">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <NumberField label="Total savings now" value={finance.totalSavings} onChange={v => set('totalSavings', v)} min={0} max={100000000} prefix="₹" />
                <NumberField label="Monthly SIP/investments" value={finance.monthlyInvestments} onChange={v => set('monthlyInvestments', v)} min={0} max={1000000} prefix="₹" />
              </div>
              {income > 0 && (
                (finance.monthlyInvestments ?? 0) === 0 ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <p>Not investing yet. ₹{Math.round(hypotheticalSip).toLocaleString('en-IN')}/month invested grows to {fmtINR(sipFV(hypotheticalSip))} in 20 years.</p>
                    <Link href="/tools/finance/sip" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">Try the SIP Calculator →</Link>
                  </div>
                ) : (
                  <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                    ₹{(finance.monthlyInvestments ?? 0).toLocaleString('en-IN')}/month grows to {fmtINR(sipFV(finance.monthlyInvestments ?? 0))} in 20 years ✓
                  </p>
                )
              )}
            </FieldSection>

            <FieldSection title="Debt">
              <p className="calc-label">Total debt (loans + credit cards combined)</p>
              <div className="flex items-center gap-3 mb-1">
                <button onClick={() => set('totalDebt', 0)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all flex-shrink-0 ${
                    finance.totalDebt === 0 ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-teal-400'
                  }`}>No debt ✓</button>
                <input type="number" value={finance.totalDebt ?? ''} onChange={e => set('totalDebt', Number(e.target.value) || 0)}
                  placeholder="or enter amount"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100" />
              </div>
              {finance.totalDebt != null && (
                <p className={`text-xs font-bold mt-1 ${debtStyle.color}`}>
                  {finance.totalDebt === 0 ? debtStyle.label : `Debt ratio: ${debtToIncome.toFixed(1)}x annual income — ${debtStyle.label}`}
                </p>
              )}
            </FieldSection>

            <FieldSection title="Protection">
              <div className="grid grid-cols-2 gap-3">
                <TogglePill label="Emergency fund? (3+ months expenses saved)" value={finance.hasEmergencyFund} onChange={v => set('hasEmergencyFund', v)} />
                <TogglePill label="Health insurance?" value={finance.hasInsurance} onChange={v => set('hasInsurance', v)} />
                <TogglePill label="Life insurance?" value={finance.hasLifeInsurance} onChange={v => set('hasLifeInsurance', v)} />
              </div>
              {finance.hasEmergencyFund === false && finance.hasInsurance === false && (
                <div className="mt-3 p-3 rounded-lg text-xs bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400">
                  No emergency fund + no insurance = financial risk. One medical event can erase years of savings.
                </div>
              )}
            </FieldSection>

            <FieldSection title="Investment risk (optional)">
              <p className="calc-label">Rough % of your investments in equity/stocks (vs. debt, FDs, cash)</p>
              <SliderRow value={finance.equityAllocationPct ?? 50} min={0} max={100} step={5}
                display={v => `${v}% equity`} onChange={v => set('equityAllocationPct', v)} />
              {finance.equityAllocationPct != null && body.age != null && (
                <p className="text-xs text-gray-400 mt-1">
                  Classic rule of thumb for your age: ≈{100 - body.age}% equity. We'll flag it if yours is well outside that range.
                </p>
              )}
              <p className="calc-label mt-4">If your portfolio dropped 20% in a month, you'd most likely...</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { v: 'sell' as const, label: 'Sell' },
                  { v: 'hold' as const, label: 'Hold' },
                  { v: 'buy-more' as const, label: 'Buy more' },
                ]).map(opt => (
                  <button key={opt.v} onClick={() => set('riskTolerance', opt.v)}
                    className={`py-2.5 rounded-lg text-xs font-bold border-2 transition-all ${
                      finance.riskTolerance === opt.v ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-teal-400'
                    }`}>{opt.label}</button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-2">Skip this section if you're not sure — it only affects your score if you answer it.</p>
            </FieldSection>

            <div className="pt-2">
              <button onClick={onCalculate} disabled={!income}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${
                  income ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                }`}>
                Calculate my complete score →
              </button>
            </div>
          </div>

          {/* Right 40% — sticky live calculation, real finance numbers only */}
          <div className="lg:col-span-2 lg:sticky lg:top-6 space-y-4">
            {income > 0 ? (
              <div className="bg-teal-600 rounded-2xl p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-100 mb-3">💰 Your monthly numbers</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] text-teal-100">Monthly surplus (income − expenses)</p>
                    <p className="text-3xl font-black">{fmtINR(Math.max(0, income - (finance.monthlyExpenses ?? 0)))}</p>
                  </div>
                  {savingsRate != null && (
                    <div>
                      <p className="text-[11px] text-teal-100">Savings rate</p>
                      <p className="text-xl font-bold">{Math.round(savingsRate * 100)}%</p>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-teal-100 mt-3">Straight from your own numbers — no assumptions, no multipliers.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
                <p className="text-sm text-gray-400">Enter your income to see your real monthly numbers.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// RESULTS
// ════════════════════════════════════════════════════════════════════════

interface ResultsProps {
  score: WellFiScore; body: Partial<BodyInputs>; finance: Partial<FinanceInputs>; history: WellFiScore[]; onRetake: () => void;
}

function Results({ score, body, finance, history, onRetake }: ResultsProps) {
  const animatedOverall = useCountUp(score.overall);
  const [whyOpen, setWhyOpen] = useState(false);
  const [netWorth, setNetWorth] = useState<number | null>(null);

  useEffect(() => {
    getSnapshots().then(snaps => setNetWorth(snaps.length > 0 ? snaps[snaps.length - 1].netWorth : null));
  }, []);

  const hasRawInputs = body.age != null && finance.monthlyIncome != null;
  const b = body as BodyInputs;
  const f = finance as FinanceInputs;

  const trendArrow = score.scoreChange == null ? null : score.scoreChange > 0 ? '↑' : score.scoreChange < 0 ? '↓' : '→';
  const trendColor = score.scoreChange == null ? '' : score.scoreChange > 0 ? 'text-green-400' : score.scoreChange < 0 ? 'text-red-400' : 'text-gray-400';

  const dataPointCount = hasRawInputs ? 15 : 8;

  const sortedDims = [...score.dimensions].sort((a, b2) => a.score - b2.score);
  const lowestDim = sortedDims[0];

  const priorScores = history.filter(h => h.id !== score.id);
  const isNewBest = priorScores.length > 0 && score.overall > Math.max(...priorScores.map(h => h.overall));
  // A version mismatch (see SCORE_VERSION in lib/wellfilab-score.ts) means
  // scoreChange was deliberately left undefined even though a prior score
  // exists — say so, rather than silently showing no trend at all.
  const recalculatedUnderNewModel = score.scoreChange == null && priorScores.length > 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">

      {/* SECTION 1: Score reveal */}
      <div className="relative overflow-hidden bg-gray-950">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 py-16 text-center">
          {isNewBest && (
            <div className="inline-flex items-center gap-1.5 mb-4 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold animate-pulse">
              🎉 New personal best!
            </div>
          )}
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Your WellFiLab Score</p>
          <p className="text-7xl font-black text-white leading-none mb-2">{animatedOverall}</p>
          <div className="flex items-center justify-center gap-3 mb-4 text-sm flex-wrap">
            {trendArrow && <span className={`font-bold ${trendColor}`}>{trendArrow} {Math.abs(score.scoreChange ?? 0)} from last time</span>}
            <span className="text-white/50">{scoreLabel(score.overall)} band</span>
          </div>
          {recalculatedUnderNewModel && (
            <p className="text-white/40 text-xs mb-2">Recalculated under an improved scoring model — no trend shown against your last score to avoid comparing different formulas.</p>
          )}
          <p className="text-white/40 text-xs">Based on {dataPointCount} real data points</p>
          <div className="print:hidden flex items-center justify-center gap-2 mt-5 flex-wrap">
            <button onClick={onRetake} className="inline-flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-white border border-white/20 hover:border-white/40 rounded-full px-4 py-2 transition-colors">
              🔄 Retake with new numbers
            </button>
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-white border border-white/20 hover:border-white/40 rounded-full px-4 py-2 transition-colors">
              🖨️ Download / print report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* SECTION 2: Calculation breakdown */}
        {hasRawInputs && (
          <CalculationBreakdown score={score} whyOpen={whyOpen} setWhyOpen={setWhyOpen} />
        )}

        {/* SECTION 2B: What your score means for your life */}
        <ScoreImpactSection score={score} />

        {/* SECTION 2B-ii: How you compare */}
        <BenchmarkSection score={score} history={history} />

        {/* SECTION 2B-iii: Risk management plan — age + risk-tolerance adjusted, real actions */}
        {hasRawInputs && (
          <RiskManagementSection
            age={b.age} netWorth={netWorth} monthlyIncome={f.monthlyIncome} monthlyExpenses={f.monthlyExpenses}
            equityAllocationPct={f.equityAllocationPct} riskTolerance={f.riskTolerance}
            hasEmergencyFund={f.hasEmergencyFund} hasInsurance={f.hasInsurance} hasLifeInsurance={f.hasLifeInsurance}
          />
        )}

        {/* SECTION 2C: What-if simulator — interactive only, not meaningful in a printed report */}
        {hasRawInputs && <div className="print:hidden"><WhatIfSimulator body={b} finance={f} baseline={score} /></div>}

        {/* SECTION 3: Archetype */}
        <ArchetypeCard score={score} />

        {/* SECTION 5: 6 Dimensions */}
        <DimensionGrid dimensions={score.dimensions} />

        {/* SECTION 6: Top actions */}
        {score.actions.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Do this next</p>
            <div className="space-y-3">
              {score.actions.map(a => (
                <div key={a.rank} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{a.rank}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{a.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-2">{a.why}</p>
                      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">{a.impact}</p>
                      {a.toolSlug && a.toolCat && (
                        <Link href={`/tools/${a.toolCat}/${a.toolSlug}`} className="inline-block text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 mt-2 underline">
                          Try the tool →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 7: Roadmap preview */}
        <div className="rounded-2xl bg-gray-950 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">Your 90-day roadmap starts here</p>
          <p className="text-white font-bold mb-1">Phase 1: {lowestDim.label}</p>
          <p className="text-sm text-gray-400 mb-5">{lowestDim.insight}</p>
          <Link href="/roadmap" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all">
            See your full personalised roadmap →
          </Link>
        </div>

        {/* SECTION 8: Trajectories + Save & share */}
        {score.trajectories && <TrajectoriesSection trajectories={score.trajectories} />}

        <Link href="/goals" className="print:hidden flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700 p-5 transition-all group">
          <span className="text-3xl flex-shrink-0">🎯</span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-900 dark:text-white text-sm">Turn this score into a tracked goal</p>
            <p className="text-xs text-gray-400 mt-0.5">Set a target — {score.overall + 10}/100, a net worth number, a sleep target — and check progress monthly.</p>
          </div>
          <span className="flex-shrink-0 text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform">Set a goal →</span>
        </Link>

        <div className="print:hidden"><ShareCard score={score} /></div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
          <p className="text-2xl mb-2">🔥</p>
          <p className="font-bold text-gray-900 dark:text-white text-sm">{score.streakDays}-review streak</p>
          {[3, 6, 12].includes(score.streakDays) && (
            <p className="text-xs font-bold text-amber-500 mt-1">🏅 {score.streakDays} consecutive reviews — a real habit!</p>
          )}
          {priorScores.length >= 4 && (
            <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-1">📊 {priorScores.length + 1} assessments tracked — that's real, visible history.</p>
          )}
          <p className="text-xs text-gray-400 mt-1 mb-4">Score saved on this device. Come back in 30 days to track your progress.</p>
          <button onClick={onRetake} className="print:hidden text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
            Retake with new numbers
          </button>
        </div>

      </div>
    </div>
  );
}

const DIM_GROUP_LABEL: Record<'body' | 'mind' | 'wealth', string> = { body: '💪 Body', mind: '🧠 Mind', wealth: '💰 Wealth' };

function CalculationBreakdown({ score, whyOpen, setWhyOpen }: {
  score: WellFiScore; whyOpen: boolean; setWhyOpen: (v: boolean) => void;
}) {
  const factors = score.scoreFactors ?? [];
  if (factors.length === 0) return null;

  const groups: ('body' | 'mind' | 'wealth')[] = ['body', 'mind', 'wealth'];
  const sortedDims = [...score.dimensions].sort((a, b) => b.score - a.score);
  const strongest = sortedDims[0];
  const weakest = sortedDims[sortedDims.length - 1];
  const biggestOpportunity = [...factors].sort((a, b) => a.points - b.points)[0];
  const gains = factors.filter(f => f.points > 0);
  // Distinct from "biggest opportunity" (most points to gain): this flags exposure to a
  // single catastrophic event, regardless of how many points it costs day-to-day.
  const RISK_IDS = ['emergency-fund', 'insurance', 'debt-wealth'];
  const catastrophicRisk = factors.find(f => RISK_IDS.includes(f.id) && f.points < 0);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
      <p className="font-bold text-gray-900 dark:text-white mb-1">How your score was calculated</p>
      <p className="text-xs text-gray-400 mb-5">Every factor below is pulled directly from the same numbers that computed your score — nothing here is reconstructed after the fact.</p>

      {groups.map(g => {
        const rows = factors.filter(f => f.dimension === g);
        if (rows.length === 0) return null;
        return (
          <div key={g} className="mb-5 last:mb-0">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{DIM_GROUP_LABEL[g]}</p>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              <div className="grid grid-cols-3 gap-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600">
                <span>Factor</span><span className="text-center">Your value</span><span className="text-right">Score impact</span>
              </div>
              {rows.map(r => (
                <div key={r.id} className="grid grid-cols-3 gap-2 py-2.5 items-center">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{r.label}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 text-center">{r.value}</span>
                  <span className={`text-sm font-bold text-right ${r.points < 0 ? 'text-red-500' : r.points > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                    {r.points === 0 ? '±0' : r.points > 0 ? `+${r.points}` : r.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="grid sm:grid-cols-2 gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900">
          <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400 mb-0.5">Strongest area</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{strongest.label} — {strongest.score}/100</p>
        </div>
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-0.5">Weakest area</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{weakest.label} — {weakest.score}/100</p>
        </div>
        {catastrophicRisk && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 sm:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-0.5">Biggest risk</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {catastrophicRisk.id === 'emergency-fund' ? 'No emergency fund — one unexpected expense could set you back years, not just points'
                : catastrophicRisk.id === 'insurance' ? 'No health insurance — a single hospitalisation can cost ₹3-15L out of pocket'
                : 'High debt load relative to income — a rate rise or income dip hits hard here first'}
            </p>
          </div>
        )}
        {biggestOpportunity && biggestOpportunity.points < 0 && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 sm:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-0.5">Biggest opportunity</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Fixing {biggestOpportunity.label.toLowerCase()} is worth the most points ({biggestOpportunity.points})</p>
          </div>
        )}
      </div>

      {gains.length === 0 && (
        <p className="text-xs text-gray-400 mt-3">No factor is currently adding points — every row above is either neutral or costing you. That also means every fix compounds cleanly.</p>
      )}

      <button onClick={() => setWhyOpen(!whyOpen)} className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline mt-4">
        See methodology {whyOpen ? '▲' : '▼'}
      </button>
      {whyOpen && (
        <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
          <p>
            Body, Mind and Wealth each start at 100 and lose points for every factor above that falls short of a healthy
            reference range (e.g. under 7.5 hours of sleep, a savings rate below 20%, no emergency fund). Life blends
            all three, weighted down further when they're far apart from each other — because one struggling area tends
            to drag the others with it. Overall blends Body, Mind and Wealth equally (28% each) plus Life (16%).
          </p>
          <p>
            Right now that's your {weakest.label.toLowerCase()}, which is why the roadmap below starts there. This is a
            rule-based model reflecting general, published health and financial research — not a medical or financial
            diagnosis, and not measured against other WellFiLab users' real data.
          </p>
          <p className="text-[11px] text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-700">
            Scoring methodology v2 · Algorithm last updated 17 Jul 2026 · <Link href="/score/methodology" className="underline hover:text-teal-600 dark:hover:text-teal-400">Full methodology, every formula →</Link>
          </p>
        </div>
      )}
    </div>
  );
}

const SCORE_BANDS = [
  { label: 'Critical',    lo: 0,  hi: 19,  color: '#ef4444' },
  { label: 'Needs Work',  lo: 20, hi: 39,  color: '#f59e0b' },
  { label: 'Average',     lo: 40, hi: 59,  color: '#eab308' },
  { label: 'Good',        lo: 60, hi: 79,  color: '#0d9488' },
  { label: 'Excellent',   lo: 80, hi: 100, color: '#10b981' },
];

function ScoreImpactSection({ score }: { score: WellFiScore }) {
  const body = score.body, wealth = score.wealth;

  const healthText = body < 50
    ? "Your physical habits are costing you energy and focus daily. People with scores above 70 report significantly higher productivity."
    : body <= 70
    ? "Solid foundation. Small improvements here have outsized life impact."
    : "Strong physical score. Maintain these habits — they're protecting your future.";

  const financialText = wealth < 50
    ? "Your financial foundation needs attention. Without an emergency fund and investments, one unexpected event can set you back years."
    : wealth <= 70
    ? "Decent foundation. The gap between where you are and financial independence is closeable."
    : "Strong financial habits. Focus on optimising returns and accelerating toward your goals.";

  const bothLow = body < 60 && wealth < 60;
  const bothHigh = body >= 70 && wealth >= 70;
  const healthHighWealthLow = body >= 70 && wealth < 60;
  const wealthHighHealthLow = wealth >= 70 && body < 60;

  const connectionText = bothHigh
    ? "Both engines are firing. Most people never get body and wealth working together like this — the discipline that built one is now compounding the other."
    : bothLow
    ? "Your health and finances are connected. Stress raises cortisol → impulse spending. Poor sleep → poor decisions → financial mistakes. Fixing one helps the other."
    : healthHighWealthLow
    ? "Your health score suggests strong discipline. Apply that same discipline to finances — the habits that built your body will build your wealth."
    : wealthHighHealthLow
    ? "Financial success built on poor health is fragile. Your body is your most important asset. Protect it."
    : "Your body and wealth scores are both moving in a reasonable direction — keep closing the gap between them, since each one makes the other easier.";

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">What your score means for your life</p>
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-1.5">💪 Health</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{healthText}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1.5">💰 Financial</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{financialText}</p>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-teal-50 dark:from-purple-950/20 dark:to-teal-950/20 border border-purple-100 dark:border-purple-900">
          <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-1.5">🔗 The connection</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{connectionText}</p>
        </div>
      </div>
    </div>
  );
}

function BenchmarkSection({ score, history }: { score: WellFiScore; history: WellFiScore[] }) {
  const sorted = [...history].filter(h => h.date).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
  // Same rule as the header trend: only compare scores computed under the
  // same formula version, so an improvement to the model never looks like
  // a real-life regression.
  const sameVersion = sorted.filter(h => h.scoreVersion === score.scoreVersion);
  const first = sameVersion[0];
  const best = sameVersion.reduce<WellFiScore | null>((b, h) => (!b || h.overall > b.overall) ? h : b, null);
  const vsFirst = first && first.id !== score.id ? score.overall - first.overall : null;
  const vsBest = best && best.id !== score.id ? score.overall - best.overall : null;

  const dims: { label: string; score: number }[] = [
    { label: 'Body', score: score.body }, { label: 'Mind', score: score.mind },
    { label: 'Wealth', score: score.wealth }, { label: 'Life', score: score.life },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
      <p className="font-bold text-gray-900 dark:text-white mb-1">How you compare</p>
      <p className="text-xs text-gray-400 mb-5">
        Against WellFiLab's own rating scale — not other users' scores. We don't collect or share real population data, so we won't claim we do.
      </p>

      <div className="mb-2 flex h-3 rounded-full overflow-hidden">
        {SCORE_BANDS.map(band => (
          <div key={band.label} style={{ width: `${band.hi - band.lo + 1}%`, background: band.color }} />
        ))}
      </div>
      <div className="relative h-4 mb-1">
        <div className="absolute top-0 -translate-x-1/2 flex flex-col items-center" style={{ left: `${score.overall}%` }}>
          <div className="w-0.5 h-3 bg-gray-900 dark:bg-white" />
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mb-4">
        {SCORE_BANDS.map(b => <span key={b.label}>{b.label}</span>)}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
        Your overall score of <strong className="text-gray-900 dark:text-white">{score.overall}/100</strong> falls in the <strong style={{ color: scoreColor(score.overall) }}>{scoreLabel(score.overall)}</strong> band.
      </p>

      {(vsFirst != null || vsBest != null) && (
        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          {vsFirst != null && (
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">vs your first assessment</p>
              <p className={`text-sm font-bold ${vsFirst > 0 ? 'text-green-500' : vsFirst < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                {vsFirst > 0 ? `↑ +${vsFirst}` : vsFirst < 0 ? `↓ ${vsFirst}` : 'No change'}
              </p>
            </div>
          )}
          {vsBest != null && (
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">vs your best score</p>
              <p className={`text-sm font-bold ${vsBest >= 0 ? 'text-green-500' : 'text-amber-500'}`}>
                {vsBest === 0 ? 'This is your best yet 🎉' : vsBest > 0 ? `↑ +${vsBest} — new best 🎉` : `↓ ${vsBest} from your best`}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        <div className="grid grid-cols-3 gap-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600">
          <span>Dimension</span><span className="text-center">Your score</span><span className="text-right">Band</span>
        </div>
        {dims.map(d => (
          <div key={d.label} className="grid grid-cols-3 gap-2 py-2.5 items-center">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{d.label}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 text-center">{d.score}/100</span>
            <span className="text-sm font-bold text-right" style={{ color: scoreColor(d.score) }}>{scoreLabel(d.score)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const EQUITY_VERDICT_STYLE: Record<string, string> = {
  'Appropriate': 'text-green-600 dark:text-green-400',
  'High for your age': 'text-red-600 dark:text-red-400',
  'Conservative for your horizon': 'text-amber-600 dark:text-amber-400',
  'Not yet answered': 'text-gray-400',
};

function RiskManagementSection({ age, netWorth, monthlyIncome, monthlyExpenses, equityAllocationPct, riskTolerance, hasEmergencyFund, hasInsurance, hasLifeInsurance }: {
  age: number; netWorth: number | null; monthlyIncome: number; monthlyExpenses: number;
  equityAllocationPct?: number; riskTolerance?: 'sell' | 'hold' | 'buy-more';
  hasEmergencyFund: boolean; hasInsurance: boolean; hasLifeInsurance?: boolean;
}) {
  const nwVerdict = netWorth != null ? netWorthVerdict(age, netWorth) : null;
  const plan = buildRiskManagementPlan({
    age, netWorth, netWorthVerdictLabel: nwVerdict, monthlyIncome, monthlyExpenses,
    equityAllocationPct, riskTolerance, hasEmergencyFund, hasInsurance, hasLifeInsurance,
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
      <p className="font-bold text-gray-900 dark:text-white mb-1">Your risk management plan</p>
      <p className="text-xs text-gray-400 mb-5">
        Adjusted for your age ({age}){riskTolerance ? ` and stated risk tolerance` : ''} — not the same advice for everyone.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Target allocation for age {age}</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{plan.recommendedEquityPct}% equity / {plan.recommendedDebtCashPct}% debt+cash</p>
          {plan.currentEquityPct != null && (
            <p className={`text-xs font-semibold mt-1 ${EQUITY_VERDICT_STYLE[plan.equityVerdict]}`}>
              You're at {plan.currentEquityPct}% — {plan.equityVerdict}
            </p>
          )}
        </div>
        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Emergency fund target</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {plan.emergencyFundMonths} months{plan.emergencyFundTarget ? ` — ${fmtINR(plan.emergencyFundTarget)}` : ''}
          </p>
          <p className="text-xs text-gray-400 mt-1">{age >= 45 ? 'Larger buffer — less runway to recover this close to retirement' : 'Standard 3-month buffer for your age'}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Health insurance target</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{fmtINR(plan.healthInsuranceTarget)}</p>
          <p className="text-xs text-gray-400 mt-1">Indicative for your age band — not underwriting advice</p>
        </div>
        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Life insurance target</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{plan.lifeInsuranceTarget ? fmtINR(plan.lifeInsuranceTarget) : '—'}</p>
          <p className="text-xs text-gray-400 mt-1">≈10× annual income — the standard rule of thumb</p>
        </div>
      </div>

      {plan.netWorthVerdict && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Net worth for age {age}: <span className="font-bold text-gray-900 dark:text-white">{plan.netWorthVerdict.label}</span> — about {plan.netWorthVerdict.ratio.toFixed(1)}× the typical figure for your age band.
        </p>
      )}

      {plan.actions.length > 0 && (
        <div className="space-y-2">
          {plan.actions.map((a, i) => (
            <div key={i} className="flex gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
              <span className="flex-shrink-0">→</span><span>{a}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// QuickInputs is accepted but ignored by calculateFullScore (real inputs drive everything
// once finance data exists) — this placeholder exists only to satisfy the signature.
const DUMMY_QUICK: QuickInputs = { healthFeeling: 3, financeFeeling: 3, stressFeeling: 3 };

function WhatIfSimulator({ body, finance, baseline }: { body: BodyInputs; finance: FinanceInputs; baseline: WellFiScore }) {
  const [sleepHours, setSleepHours] = useState(body.sleepHours);
  const [exerciseDays, setExerciseDays] = useState(body.exerciseDays);
  const [stressLevel, setStressLevel] = useState(body.stressLevel);
  const [hasEmergencyFund, setHasEmergencyFund] = useState(finance.hasEmergencyFund);
  const [monthlyInvestments, setMonthlyInvestments] = useState(finance.monthlyInvestments);

  const changed = sleepHours !== body.sleepHours || exerciseDays !== body.exerciseDays ||
    stressLevel !== body.stressLevel || hasEmergencyFund !== finance.hasEmergencyFund ||
    monthlyInvestments !== finance.monthlyInvestments;

  // Real algorithm, real inputs — this is not a separate re-implementation of the
  // scoring math, so it can never drift from what actually determines your score.
  const projected = calculateFullScore(
    DUMMY_QUICK,
    { ...body, sleepHours, exerciseDays, stressLevel },
    { ...finance, hasEmergencyFund, monthlyInvestments },
    []
  );

  const reset = () => {
    setSleepHours(body.sleepHours); setExerciseDays(body.exerciseDays);
    setStressLevel(body.stressLevel); setHasEmergencyFund(finance.hasEmergencyFund);
    setMonthlyInvestments(finance.monthlyInvestments);
  };

  const delta = projected.overall - baseline.overall;
  const dimDeltas = [
    { label: 'Body', d: projected.body - baseline.body },
    { label: 'Mind', d: projected.mind - baseline.mind },
    { label: 'Wealth', d: projected.wealth - baseline.wealth },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-1">
        <p className="font-bold text-gray-900 dark:text-white">What-if simulator</p>
        {changed && <button onClick={reset} className="text-xs font-bold text-gray-400 hover:text-teal-600 dark:hover:text-teal-400">Reset to my numbers</button>}
      </div>
      <p className="text-xs text-gray-400 mb-5">Drag the levers below to see how your score would change — computed with the exact same formula as your real score.</p>

      <div className="space-y-4 mb-5">
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-gray-600 dark:text-gray-300">Sleep</span><span className="text-gray-400">{sleepHours}h</span></div>
          <input type="range" min={4} max={9} step={0.5} value={sleepHours} onChange={e => setSleepHours(+e.target.value)} className="w-full accent-teal-600" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-gray-600 dark:text-gray-300">Exercise</span><span className="text-gray-400">{exerciseDays} days/week</span></div>
          <input type="range" min={0} max={7} step={1} value={exerciseDays} onChange={e => setExerciseDays(+e.target.value)} className="w-full accent-teal-600" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-gray-600 dark:text-gray-300">Stress level</span><span className="text-gray-400">{stressLevel}/10</span></div>
          <input type="range" min={1} max={10} step={1} value={stressLevel} onChange={e => setStressLevel(+e.target.value)} className="w-full accent-teal-600" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-gray-600 dark:text-gray-300">Monthly investments</span><span className="text-gray-400">₹{monthlyInvestments.toLocaleString('en-IN')}</span></div>
          <input type="range" min={0} max={Math.max(50000, finance.monthlyIncome)} step={500} value={monthlyInvestments} onChange={e => setMonthlyInvestments(+e.target.value)} className="w-full accent-teal-600" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={hasEmergencyFund} onChange={e => setHasEmergencyFund(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Have an emergency fund</span>
        </label>
      </div>

      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Projected score</p>
            <p className="text-3xl font-black" style={{ color: scoreColor(projected.overall) }}>{projected.overall}<span className="text-sm text-gray-400">/100</span></p>
          </div>
          {changed && (
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">vs your real score</p>
              <p className={`text-lg font-black ${delta > 0 ? 'text-green-500' : delta < 0 ? 'text-red-500' : 'text-gray-400'}`}>{delta > 0 ? `+${delta}` : delta}</p>
            </div>
          )}
        </div>
        {changed && (
          <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            {dimDeltas.filter(d => d.d !== 0).map(d => (
              <span key={d.label}>{d.label} <strong className={d.d > 0 ? 'text-green-500' : 'text-red-500'}>{d.d > 0 ? `+${d.d}` : d.d}</strong></span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared presentational pieces ─────────────────────────────────────────

function ArchetypeCard({ score }: { score: WellFiScore }) {
  const a = score.archetype;
  return (
    <div className={`rounded-2xl overflow-hidden bg-gradient-to-br ${a.color} p-7 text-white`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{a.emoji}</span>
        <div>
          <h2 className="text-2xl font-extrabold leading-tight">{a.name}</h2>
          <p className="text-sm text-white/80 font-semibold">{a.tagline}</p>
        </div>
      </div>
      <p className="text-sm text-white/90 leading-relaxed mb-4">{a.description}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-white/10 rounded-xl p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Strength</p>
          <p className="text-xs text-white/90 leading-relaxed">{a.strength}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Challenge</p>
          <p className="text-xs text-white/90 leading-relaxed">{a.challenge}</p>
        </div>
      </div>
    </div>
  );
}

function TrajectoriesSection({ trajectories }: { trajectories: Trajectory[] }) {
  const style: Record<Trajectory['scenario'], string> = {
    current:  'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50',
    improved: 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20',
    optimal:  'border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/20',
  };
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Your life, three ways</p>
      <div className="grid sm:grid-cols-3 gap-3">
        {trajectories.map(t => (
          <div key={t.scenario} className={`rounded-2xl border-2 p-4 ${style[t.scenario]}`}>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-3">{t.label}</p>
            <p className="text-lg font-black text-gray-900 dark:text-white">{fmtINR(t.netWorthAt60)}</p>
            <p className="text-[10px] text-gray-400 mb-2">Net worth at 60</p>
            <div className="space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
              <p>Passive income: {fmtINR(t.monthlyPassiveIncome)}/mo at a 4% withdrawal rate</p>
            </div>
            <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">{t.keyChange}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 mt-3">
        Same assumed 12% annual return in all three scenarios — only the monthly SIP amount changes between them, since that's the real, controllable lever. Real returns vary; this is a scenario model, not a guarantee.
      </p>
    </div>
  );
}

function DimensionGrid({ dimensions }: { dimensions: Dimension[] }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">The full breakdown</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {dimensions.map(d => (
          <div key={d.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{d.icon}</span>
              <span className="text-lg font-black" style={{ color: scoreColor(d.score) }}>{d.score}</span>
            </div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">{d.label}</p>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.score}%`, background: scoreColor(d.score) }} />
            </div>
            {d.insight && <p className="text-[11px] text-gray-400">{d.insight}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ShareCard({ score }: { score: WellFiScore }) {
  const [copied, setCopied] = useState<'text' | 'link' | null>(null);
  const shareText = `I just discovered I'm ${score.archetype.name} on WellFiLab ${score.archetype.emoji}\nMy score: ${score.overall}/100 (${scoreLabel(score.overall)})\n\nFind your archetype free at ${SITE_URL}/score`;
  const shareUrl = `${SITE_URL}/score`;

  const copy = async (text: string, which: 'text' | 'link') => {
    try { await navigator.clipboard.writeText(text); setCopied(which); setTimeout(() => setCopied(null), 2000); } catch { /* noop */ }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
      <p className="font-bold text-gray-900 dark:text-white mb-1">Share your archetype</p>
      <p className="text-sm text-gray-400 mb-5">{score.archetype.emoji} {score.archetype.name} · {score.overall}/100</p>
      <div className="flex flex-wrap justify-center gap-2.5">
        <button onClick={() => copy(shareText, 'text')} className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all">
          {copied === 'text' ? '✓ Copied!' : 'Copy my archetype'}
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-all">WhatsApp</a>
        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 text-white text-xs font-bold transition-all">Twitter / X</a>
        <button onClick={() => copy(shareUrl, 'link')} className="px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold hover:border-teal-400 transition-all">
          {copied === 'link' ? '✓ Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}

// ── Form controls ──────────────────────────────────────────────────────

function FieldSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-4">{title}</p>
      {children}
    </div>
  );
}

function NumberField({ label, value, onChange, min, max, prefix }: {
  label: string; value: number | undefined; onChange: (v: number) => void; min: number; max: number; prefix?: string;
}) {
  const [text, setText] = useState(value != null ? String(value) : '');
  useEffect(() => { setText(value != null ? String(value) : ''); }, [value]);

  const commit = () => {
    const n = Number(text);
    if (text.trim() === '' || !Number.isFinite(n)) { setText(''); return; }
    const clamped = Math.max(min, Math.min(max, n));
    setText(String(clamped));
    onChange(clamped);
  };

  return (
    <div>
      <label className="calc-label">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">{prefix}</span>}
        <input type="number" value={text} onChange={e => setText(e.target.value)} onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          className={`w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-teal-500 ${prefix ? 'pl-7 pr-3.5' : 'px-3.5'}`} />
      </div>
    </div>
  );
}

function SliderRow({ label, value, onChange, min, max, step, display, trackColor }: {
  label?: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number;
  display: (v: number) => string; trackColor?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        {label && <label className="calc-label mb-0">{label}</label>}
        <span className="text-sm font-bold text-teal-600 dark:text-teal-400 ml-auto">{display(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-teal-600" style={trackColor ? { accentColor: trackColor } : undefined} />
    </div>
  );
}

function TogglePill({ label, value, onChange }: { label: string; value: boolean | undefined; onChange: (v: boolean) => void }) {
  return (
    <div>
      <p className="calc-label">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(opt => (
          <button key={String(opt.v)} onClick={() => onChange(opt.v)}
            className={`py-2 rounded-lg text-xs font-bold border-2 transition-all ${
              value === opt.v ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-teal-400'
            }`}>{opt.l}</button>
        ))}
      </div>
    </div>
  );
}

function PreviewBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</span>
        <span className="text-xs font-bold text-gray-900 dark:text-white">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
