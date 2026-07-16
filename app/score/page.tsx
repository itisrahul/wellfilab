'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  calculateBodyScore, calculateFullScore, scoreColor,
  type QuickInputs, type BodyInputs, type FinanceInputs, type WellFiScore,
  type Insight, type Action, type Trajectory, type Dimension,
} from '@/lib/wellfilab-score';
import { getLatestScore, getScoreHistory, saveScore } from '@/lib/scoreStorage';
import { SITE_URL } from '@/config/site';

// ── Companion store for the RAW inputs behind a score ───────────────────────
// saveScore() only persists the computed WellFiScore, not the BodyInputs/
// FinanceInputs that produced it — but the results page's calculation
// breakdown and health-wealth math cards need those raw numbers to stay
// verifiable for a returning user too, not just right after calculating.
// Deliberately not part of lib/scoreStorage.ts — a small, page-local
// companion key, same plain-localStorage pattern already used elsewhere
// (wfl_roadmap_start etc.) rather than growing the shared adapter's surface.
const INPUTS_KEY = 'wfl_score_inputs_v1';
function saveRawInputs(body: BodyInputs, finance: FinanceInputs) {
  try { window.localStorage.setItem(INPUTS_KEY, JSON.stringify({ body, finance })); } catch { /* noop */ }
}
function loadRawInputs(): { body: BodyInputs; finance: FinanceInputs } | null {
  try {
    const raw = window.localStorage.getItem(INPUTS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

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
  const annualIncome = income * 12;
  const savingsRate = income > 0 ? (income - expenses) / income : null;
  const sleepGap = Math.max(0, 7.5 - effectiveBody.sleepHours);
  const sleepCostPreview = income > 0 ? Math.round(sleepGap * 0.024 * annualIncome) : 0;

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
    };
    const finalQuick = deriveQuick(effectiveBody, savingsRate, effectiveFinance.hasEmergencyFund);
    await new Promise(r => setTimeout(r, 1500));
    const result = calculateFullScore(finalQuick, effectiveBody, effectiveFinance, history);
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
      income={income} savingsRate={savingsRate} sleepCostPreview={sleepCostPreview} sleepGap={sleepGap}
      previewHealthScore={preview?.overall ?? null}
      onCalculate={calculate} />;
  }

  // stage === 'results'
  if (!score) return null;
  return (
    <div ref={resultsRef}>
      <Results score={score} body={body} finance={finance} onRetake={retake} />
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

function StageB({ finance, setFinance, body, income, savingsRate, sleepCostPreview, sleepGap, previewHealthScore, onCalculate }: {
  finance: Partial<FinanceInputs>; setFinance: React.Dispatch<React.SetStateAction<Partial<FinanceInputs>>>;
  body: BodyInputs; income: number; savingsRate: number | null; sleepCostPreview: number; sleepGap: number;
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
              </div>
              {finance.hasEmergencyFund === false && finance.hasInsurance === false && (
                <div className="mt-3 p-3 rounded-lg text-xs bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400">
                  No emergency fund + no insurance = financial risk. One medical event can erase years of savings.
                </div>
              )}
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

          {/* Right 40% — sticky live calculation */}
          <div className="lg:col-span-2 lg:sticky lg:top-6 space-y-4">
            {income > 0 && sleepGap > 0 ? (
              <div className="bg-teal-600 rounded-2xl p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-100 mb-3">💡 Estimated cost of your sleep deficit</p>
                <p className="text-sm mb-3">Based on ₹{annualIncome.toLocaleString('en-IN')}/year:</p>
                <p className="text-xs text-teal-100 leading-relaxed mb-2">
                  {sleepGap.toFixed(1)}hrs deficit × 2.4% assumed productivity impact/hr × ₹{annualIncome.toLocaleString('en-IN')}
                </p>
                <p className="text-3xl font-black">≈ {fmtINR(sleepCostPreview)}<span className="text-sm font-bold text-teal-100">/year</span></p>
                <p className="text-[11px] text-teal-100 mt-2">An estimate built from your own income and sleep gap, not a generic average — but it's a directional model, not a measured fact.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
                <p className="text-sm text-gray-400">Enter your income to see what your sleep is really costing you.</p>
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
  score: WellFiScore; body: Partial<BodyInputs>; finance: Partial<FinanceInputs>; onRetake: () => void;
}

function Results({ score, body, finance, onRetake }: ResultsProps) {
  const animatedOverall = useCountUp(score.overall);
  const [whyOpen, setWhyOpen] = useState(false);

  const hasRawInputs = body.age != null && finance.monthlyIncome != null;
  const b = body as BodyInputs;
  const f = finance as FinanceInputs;

  const trendArrow = score.scoreChange == null ? null : score.scoreChange > 0 ? '↑' : score.scoreChange < 0 ? '↓' : '→';
  const trendColor = score.scoreChange == null ? '' : score.scoreChange > 0 ? 'text-green-400' : score.scoreChange < 0 ? 'text-red-400' : 'text-gray-400';

  const dataPointCount = hasRawInputs ? 15 : 8;

  const sortedDims = [...score.dimensions].sort((a, b2) => a.score - b2.score);
  const lowestDim = sortedDims[0];

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">

      {/* SECTION 1: Score reveal */}
      <div className="relative overflow-hidden bg-gray-950">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Your WellFiLab Score</p>
          <p className="text-7xl font-black text-white leading-none mb-2">{animatedOverall}</p>
          <div className="flex items-center justify-center gap-3 mb-4 text-sm flex-wrap">
            {trendArrow && <span className={`font-bold ${trendColor}`}>{trendArrow} {Math.abs(score.scoreChange ?? 0)} from last time</span>}
            {score.percentile != null && <span className="text-white/50">Top {score.percentile}% of people your age</span>}
          </div>
          <p className="text-white/40 text-xs">Based on {dataPointCount} real data points</p>
          <button onClick={onRetake} className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-white border border-white/20 hover:border-white/40 rounded-full px-4 py-2 transition-colors">
            🔄 Retake with new numbers
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* SECTION 2: Calculation breakdown */}
        {hasRawInputs && (
          <CalculationBreakdown body={b} finance={f} score={score} whyOpen={whyOpen} setWhyOpen={setWhyOpen} />
        )}

        {/* SECTION 3: Archetype */}
        <ArchetypeCard score={score} />

        {/* SECTION 4: Health-Wealth Connection */}
        {hasRawInputs && f.monthlyIncome > 0 && (
          <div className="space-y-4">
            {b.sleepHours < 7.5 && (
              <MathCostCard emoji="💸" title="What your sleep deficit could be costing you"
                lines={[
                  `You sleep ${b.sleepHours} hours per night. Optimal: 7.5 hours.`,
                  `Your deficit: ${(7.5 - b.sleepHours).toFixed(1)} hours per night.`,
                ]}
                formula={`${(7.5 - b.sleepHours).toFixed(1)} hrs deficit × 2.4% assumed productivity impact/hr × ₹${(f.monthlyIncome * 12).toLocaleString('en-IN')} annual income`}
                amount={Math.round(Math.max(0, 7.5 - b.sleepHours) * 0.024 * f.monthlyIncome * 12)}
                note="An estimate built from your own income and sleep gap — a directional model, not a measured fact about you specifically."
                howCalculated="We apply a simplified 2.4%-per-hour productivity-impact assumption, in line with the general direction of published sleep-and-productivity research, to your own income. Individual results vary widely — treat this as a reason to take sleep seriously, not a precise bill." />
            )}
            {b.stressLevel > 6 && (
              <MathCostCard emoji="🧠" title="What high stress could be costing you"
                lines={[`Stress level: ${b.stressLevel}/10.`]}
                formula={`(${b.stressLevel}-5)/5 × 18% assumed impact × ₹${(f.monthlyIncome * 12).toLocaleString('en-IN')}`}
                amount={Math.round(Math.max(0, (b.stressLevel - 5) / 5) * 0.18 * f.monthlyIncome * 12)}
                note="An estimate, not a measured fact — sustained high stress is well-documented to reduce output, but the exact rupee figure is a simplified model."
                howCalculated="Sustained high stress is associated with elevated cortisol, which is linked to reduced cognitive output and decision quality. We translate that into a simplified income-scaled estimate — useful as a directional signal, not an exact number." />
            )}
          </div>
        )}

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

        <ShareCard score={score} />

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
          <p className="text-2xl mb-2">🔥</p>
          <p className="font-bold text-gray-900 dark:text-white text-sm">{score.streakDays} day streak</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">Score saved on this device. Come back in 30 days to track your progress.</p>
          <button onClick={onRetake} className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
            Retake with new numbers
          </button>
        </div>

      </div>
    </div>
  );
}

function CalculationBreakdown({ body, finance, score, whyOpen, setWhyOpen }: {
  body: BodyInputs; finance: FinanceInputs; score: WellFiScore; whyOpen: boolean; setWhyOpen: (v: boolean) => void;
}) {
  const bmi = body.weight / Math.pow(body.height / 100, 2);
  const sleepGap = Math.max(0, 7.5 - body.sleepHours);
  const savingsRate = finance.monthlyIncome > 0 ? (finance.monthlyIncome - finance.monthlyExpenses) / finance.monthlyIncome : 0;
  const investRate = finance.monthlyIncome > 0 ? finance.monthlyInvestments / finance.monthlyIncome : 0;

  const bmiImpact = (bmi < 18.5 || bmi > 30) ? -20 : bmi > 25 ? -10 : 0;
  const sleepImpact = -Math.round(sleepGap * 8);
  const exerciseImpact = -Math.round(Math.max(0, (4 - body.exerciseDays) * 5));
  const savingsImpact = savingsRate >= 0.3 ? 0 : savingsRate >= 0.2 ? -10 : savingsRate >= 0.1 ? -20 : savingsRate >= 0 ? -30 : -40;
  const efImpact = finance.hasEmergencyFund ? 0 : -20;
  const investImpact = investRate >= 0.2 ? 0 : investRate >= 0.1 ? -10 : investRate > 0 ? -18 : -25;

  const dim = (id: string) => score.dimensions.find(d => d.id === id);

  const rows = [
    { label: 'Sleep', value: `${body.sleepHours} hours`, impact: sleepImpact, note: dim('sleep')?.insight ?? '' },
    { label: 'Exercise', value: `${body.exerciseDays} days/week`, impact: exerciseImpact, note: dim('movement')?.insight ?? '' },
    { label: 'BMI', value: bmi.toFixed(1), impact: bmiImpact, note: bmi < 18.5 ? 'below range' : bmi > 30 ? 'above range' : bmi > 25 ? 'slightly above range' : 'healthy range' },
    { label: 'Savings rate', value: `${Math.round(savingsRate * 100)}%`, impact: savingsImpact, note: savingsRate >= 0.2 ? 'above 20% target' : 'below 20% target' },
    { label: 'Emergency fund', value: finance.hasEmergencyFund ? 'Yes' : 'No', impact: efImpact, note: finance.hasEmergencyFund ? 'Have one' : 'Missing safety net' },
    { label: 'Investments', value: `₹${finance.monthlyInvestments.toLocaleString('en-IN')}/mo`, impact: investImpact, note: dim('investing')?.insight ?? '' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
      <p className="font-bold text-gray-900 dark:text-white mb-1">How your score was calculated</p>
      <p className="text-xs text-gray-400 mb-5">Based on published health and financial research.</p>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        <div className="grid grid-cols-3 gap-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <span>Input</span><span className="text-center">Your value</span><span className="text-right">Score impact</span>
        </div>
        {rows.map(r => (
          <div key={r.label} className="grid grid-cols-3 gap-2 py-2.5 items-center">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{r.label}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 text-center">{r.value}</span>
            <span className={`text-sm font-bold text-right ${r.impact < 0 ? 'text-red-500' : 'text-green-500'}`}>{r.impact === 0 ? '±0' : r.impact}</span>
          </div>
        ))}
      </div>
      <button onClick={() => setWhyOpen(!whyOpen)} className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline mt-4">
        Why do I have this score? {whyOpen ? '▲' : '▼'}
      </button>
      {whyOpen && (
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          Your overall score blends your body, mind, and wealth scores, weighted toward whichever is lowest — because
          one struggling area tends to drag the others down with it. Right now that's your {score.dimensions.slice().sort((a, b) => a.score - b.score)[0].label.toLowerCase()},
          which is why the roadmap below starts there. As {score.dimensions.slice().sort((a, b) => a.score - b.score)[0].label.toLowerCase()} improves, expect the ripple effects on your other numbers too.
        </p>
      )}
    </div>
  );
}

function MathCostCard({ emoji, title, lines, formula, amount, note, howCalculated }: {
  emoji: string; title: string; lines: string[]; formula: string; amount: number; note?: string; howCalculated: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 p-6 text-white">
      <p className="font-bold text-base mb-3">{emoji} {title}</p>
      {lines.map((l, i) => <p key={i} className="text-sm text-teal-100 mb-1">{l}</p>)}
      <p className="text-xs text-teal-200 mt-3 mb-1 font-mono">{formula}</p>
      <p className="text-3xl font-black mt-2">= {fmtINR(amount)}<span className="text-sm font-bold text-teal-200">/year</span></p>
      {note && <p className="text-xs text-teal-200 mt-2">{note}</p>}
      <button onClick={() => setOpen(!open)} className="text-xs font-bold text-white/80 hover:text-white underline mt-3">
        How we calculate this {open ? '▲' : '▼'}
      </button>
      {open && <p className="text-xs text-teal-100 mt-2 bg-white/10 rounded-lg p-3">{howCalculated}</p>}
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
              <p>Life quality: {t.lifeQuality}/10</p>
              <p>Life expectancy: {t.lifeExpectancy}</p>
              <p>Passive income: {fmtINR(t.monthlyPassiveIncome)}/mo</p>
            </div>
            <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">{t.keyChange}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 mt-3">
        Projections from your current savings and SIP, compounding at an assumed 12% (14% for "Full potential") annual return until age 60 — real returns vary, this is a scenario model, not a guarantee.
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
  const shareText = `I just discovered I'm ${score.archetype.name} on WellFiLab ${score.archetype.emoji}\nMy score: ${score.overall}/100\n${score.percentile != null ? `Top ${score.percentile}% of people my age\n\n` : '\n'}Find your archetype free at ${SITE_URL}/score`;
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
