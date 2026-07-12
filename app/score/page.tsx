'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  calculateQuickScore, calculateBodyScore, calculateFullScore, scoreColor,
  type QuickInputs, type BodyInputs, type FinanceInputs, type WellFiScore,
  type Insight, type Action, type Trajectory, type Dimension,
} from '@/lib/wellfilab-score';
import { getLatestScore, getScoreHistory, saveScore } from '@/lib/scoreStorage';
import { getPlanAny, type Plan } from '@/lib/plans';
import { SITE_URL } from '@/config/site';

// ── Defaults ─────────────────────────────────────────────────────────────
const DEFAULT_BODY: BodyInputs = {
  age: 28, weight: 70, height: 170, sleepHours: 7, exerciseDays: 3,
  stressLevel: 5, dietQuality: 3, waterLiters: 2.5,
};
const DEFAULT_FINANCE: FinanceInputs = {
  monthlyIncome: 50000, monthlyExpenses: 35000, totalSavings: 100000,
  totalDebt: 0, monthlyInvestments: 0, hasEmergencyFund: false, hasInsurance: false,
};

// ── Small helpers ────────────────────────────────────────────────────────
function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function useCountUp(target: number, duration = 800): number {
  const [value, setValue] = useState(target);
  const prevRef = useRef(target);
  useEffect(() => {
    const start = prevRef.current;
    const startTime = performance.now();
    let raf: number;
    function tick(now: number) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (target - start) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else prevRef.current = target;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}

const INSIGHT_STYLE: Record<Insight['type'], string> = {
  warning:     'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
  opportunity: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
  connection:  'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
  strength:    'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
};

const EASE_LABEL: Record<Action['howEasy'], string> = {
  'today': 'Today', 'this-week': 'This week', 'this-month': 'This month',
};
const EASE_STYLE: Record<Action['howEasy'], string> = {
  'today':      'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
  'this-week':  'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  'this-month': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

// ── Question data (Stage 1) ──────────────────────────────────────────────
const QUICK_QUESTIONS: {
  key: keyof QuickInputs;
  emoji: string;
  question: string;
  options: { value: 1 | 2 | 3 | 4; emoji: string; label: string }[];
}[] = [
  {
    key: 'healthFeeling', emoji: '💪', question: 'How is your health right now?',
    options: [
      { value: 1, emoji: '😷', label: 'Struggling' },
      { value: 2, emoji: '😐', label: 'Getting by' },
      { value: 3, emoji: '😊', label: 'Pretty good' },
      { value: 4, emoji: '💪', label: 'Thriving' },
    ],
  },
  {
    key: 'financeFeeling', emoji: '💰', question: 'How are your finances?',
    options: [
      { value: 1, emoji: '😰', label: 'Stressed' },
      { value: 2, emoji: '😐', label: 'Managing' },
      { value: 3, emoji: '😊', label: 'Stable' },
      { value: 4, emoji: '🤑', label: 'Growing' },
    ],
  },
  {
    key: 'stressFeeling', emoji: '🧘', question: 'How stressed are you?',
    options: [
      { value: 1, emoji: '😤', label: 'Very stressed' },
      { value: 2, emoji: '😕', label: 'Somewhat' },
      { value: 3, emoji: '😌', label: 'A little' },
      { value: 4, emoji: '😄', label: 'Not at all' },
    ],
  },
];

const DIET_OPTIONS: { value: 1 | 2 | 3 | 4 | 5; emoji: string; label: string }[] = [
  { value: 1, emoji: '🍔', label: 'Poor' },
  { value: 2, emoji: '🥪', label: 'Fair' },
  { value: 3, emoji: '🍽', label: 'Average' },
  { value: 4, emoji: '🥗', label: 'Good' },
  { value: 5, emoji: '🥦', label: 'Excellent' },
];

const EXERCISE_BUCKETS = [
  { label: '0', days: 0 }, { label: '1-2', days: 1.5 },
  { label: '3-4', days: 3.5 }, { label: '5-7', days: 6 },
];

// ── Score → plan recommendation ─────────────────────────────────────────
function recommendPlan(score: WellFiScore): { planId: 'diet' | 'finance' | 'bundle'; reason: string } {
  const { body, mind, wealth } = score;
  if (body < mind && body < wealth) {
    return { planId: 'diet', reason: 'Your body score is lowest. A nutrition plan would help most.' };
  }
  if (wealth < body && wealth < mind) {
    return { planId: 'finance', reason: 'Your finance score needs most attention. A personalised finance roadmap would help.' };
  }
  return { planId: 'bundle', reason: 'Your health and finances both need attention. The bundle addresses both together.' };
}

export default function ScorePage() {
  const [mounted, setMounted] = useState(false);
  const [quick, setQuick] = useState<Partial<QuickInputs>>({});
  const [history, setHistory] = useState<WellFiScore[]>([]);
  const [score, setScore] = useState<WellFiScore | null>(null);
  const [retaking, setRetaking] = useState(false);

  const [bodyOpen, setBodyOpen]       = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [body, setBody]       = useState<BodyInputs>(DEFAULT_BODY);
  const [finance, setFinance] = useState<FinanceInputs>(DEFAULT_FINANCE);

  const debouncedBody    = useDebounced(body);
  const debouncedFinance = useDebounced(finance);

  const resultsRef = useRef<HTMLDivElement>(null);
  const bodyRef    = useRef<HTMLDivElement>(null);
  const financeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    Promise.all([getLatestScore(), getScoreHistory()]).then(([latest, hist]) => {
      setHistory(hist);
      if (latest) setScore(latest);
    });
  }, []);

  const animatedOverall = useCountUp(score?.overall ?? 0);

  const allQuickAnswered = quick.healthFeeling != null && quick.financeFeeling != null && quick.stressFeeling != null;

  const scrollTo = (ref: React.RefObject<HTMLElement>) =>
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);

  const submitQuick = async () => {
    if (!allQuickAnswered) return;
    const result = calculateQuickScore(quick as QuickInputs, history);
    const saved = await saveScore(result);
    setHistory(prev => [saved, ...prev]);
    setScore(saved);
    setRetaking(false);
    scrollTo(resultsRef);
  };

  const submitBody = async () => {
    if (!allQuickAnswered) return;
    const result = calculateBodyScore(quick as QuickInputs, body, history);
    const saved = await saveScore(result);
    setHistory(prev => [saved, ...prev]);
    setScore(saved);
    scrollTo(resultsRef);
  };

  const submitFinance = async () => {
    if (!allQuickAnswered) return;
    const result = calculateFullScore(quick as QuickInputs, body, finance, history);
    const saved = await saveScore(result);
    setHistory(prev => [saved, ...prev]);
    setScore(saved);
    scrollTo(resultsRef);
  };

  const openBody = () => { setBodyOpen(true); scrollTo(bodyRef); };
  const openFinance = () => {
    setFinanceOpen(true);
    setBodyOpen(prevBodyOpen => { if (!prevBodyOpen) { setTimeout(() => scrollTo(financeRef), 120); } return prevBodyOpen; });
    scrollTo(financeRef);
  };

  const retake = () => {
    setScore(null);
    setQuick({});
    setBodyOpen(false);
    setFinanceOpen(false);
    setRetaking(true);
  };

  // ── Live preview numbers for body/finance sliders (debounced) ──────────
  const sleepGapPreview   = Math.max(0, 7.5 - debouncedBody.sleepHours);
  const bmiPreview        = debouncedBody.weight / Math.pow(debouncedBody.height / 100, 2);
  const optimalWaterPreview = +(debouncedBody.weight * 0.033).toFixed(1);
  const sleepCostPreview  = Math.round(sleepGapPreview * 0.024 * 600000);
  const stressCostPreview = Math.round(Math.max(0, (debouncedBody.stressLevel - 5) / 5) * 0.18 * 600000);

  const savingsRatePreview = debouncedFinance.monthlyIncome > 0
    ? (debouncedFinance.monthlyIncome - debouncedFinance.monthlyExpenses) / debouncedFinance.monthlyIncome
    : 0;
  const debtToIncomePreview = debouncedFinance.totalDebt / Math.max(1, debouncedFinance.monthlyIncome * 12);
  const sipProjectionPreview = Math.round(
    debouncedFinance.monthlyInvestments * 12 * ((Math.pow(1.12, 20) - 1) / 0.12)
  );

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // STAGE 1 — no score yet: quick questions only
  // ══════════════════════════════════════════════════════════════════════
  if (!score) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-3">WellFiLab Score</p>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">Your WellFiLab Score</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-12">Answer 3 questions. Get your score in 60 seconds.</p>

          <div className="space-y-6 text-left">
            {QUICK_QUESTIONS.map(q => (
              <div key={q.key} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{q.emoji}</span>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{q.question}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {q.options.map(opt => {
                    const selected = quick[q.key] === opt.value;
                    return (
                      <button key={opt.value}
                        onClick={() => setQuick(prev => ({ ...prev, [q.key]: opt.value }))}
                        className={`flex flex-col items-center gap-1.5 py-4 px-2 rounded-xl border-2 font-semibold text-sm transition-all hover:scale-105 ${
                          selected
                            ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/20'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-teal-400'
                        }`}>
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-xs">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-8 transition-all duration-500 ${allQuickAnswered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <button onClick={submitQuick}
              className="px-10 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-lg shadow-xl shadow-teal-600/20 hover:scale-105 transition-all">
              See my score →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // RESULTS — score exists (any level)
  // ══════════════════════════════════════════════════════════════════════
  const trendArrow = score.scoreChange == null ? null : score.scoreChange > 0 ? '↑' : score.scoreChange < 0 ? '↓' : '→';
  const trendColor = score.scoreChange == null ? '' : score.scoreChange > 0 ? 'text-green-400' : score.scoreChange < 0 ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen" ref={resultsRef}>

      {retaking && <RetakeBanner />}

      {/* ── SECTION 1: Score reveal ── */}
      <div className="relative overflow-hidden bg-gray-950">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Your WellFiLab Score</p>
          <p className="text-7xl font-black text-white leading-none mb-2">{animatedOverall}</p>
          <div className="flex items-center justify-center gap-3 mb-8 text-sm">
            {trendArrow && (
              <span className={`font-bold ${trendColor}`}>{trendArrow} {Math.abs(score.scoreChange ?? 0)} from last time</span>
            )}
            {score.percentile != null && (
              <span className="text-white/50">Top {score.percentile}% of people your age</span>
            )}
          </div>
          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            {[
              { label: 'Body', v: score.body, color: '#14b8a6' },
              { label: 'Mind', v: score.mind, color: '#6366f1' },
              { label: 'Wealth', v: score.wealth, color: '#f59e0b' },
              { label: 'Life', v: score.life, color: '#22c55e' },
            ].map(d => (
              <div key={d.label} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <span className="text-sm font-black" style={{ color: d.color }}>{d.v}</span>
                <span className="text-[11px] text-white/50 uppercase tracking-wide">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* ── SECTION 2: Archetype card ── */}
        <ArchetypeCard score={score} />

        {/* ── Bridge to the roadmap — the next step after seeing your archetype ── */}
        <Link href="/roadmap"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-lg shadow-teal-600/20 hover:scale-[1.01] transition-all">
          See your personalised roadmap →
        </Link>

        {/* ── STEP 6 additions — only once full data exists ── */}
        {score.level === 'full' && score.annualHealthCost != null && (
          <HealthCostCard score={score} />
        )}
        {score.level === 'full' && score.trajectories && (
          <TrajectoriesSection trajectories={score.trajectories} />
        )}
        {score.level === 'full' && (
          <DimensionGrid dimensions={score.dimensions} />
        )}

        {/* ── SECTION 3: deeper insights CTA ── */}
        {score.level !== 'full' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <p className="font-bold text-gray-900 dark:text-white mb-1">Make your roadmap more accurate</p>
            <p className="text-sm text-gray-400 mb-5">Add a few more details and your roadmap becomes more specific to you.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <button onClick={openBody}
                className="text-left p-5 rounded-xl border-2 border-gray-100 dark:border-gray-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all">
                <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">💪 Add health details (2 min)</p>
                <p className="text-xs text-gray-400 mb-3">Sleep, exercise, weight</p>
                <p className="text-xs text-gray-400">See your health cost in ₹</p>
                <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-2">Takes 2 minutes →</p>
              </button>
              <button onClick={openFinance}
                className="text-left p-5 rounded-xl border-2 border-gray-100 dark:border-gray-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all">
                <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">💰 Add finance details (2 min)</p>
                <p className="text-xs text-gray-400 mb-3">Income, savings, debt</p>
                <p className="text-xs text-gray-400">See your full Life ROI</p>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-2">Takes 2 minutes →</p>
              </button>
            </div>
          </div>
        )}

        {/* ── SECTION 4: Top insights ── */}
        {score.insights.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">What your numbers say</p>
            <div className="space-y-3">
              {score.insights.map((ins, i) => (
                <div key={i} className={`rounded-2xl border p-5 ${INSIGHT_STYLE[ins.type]}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{ins.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{ins.headline}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ins.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION 5: Top actions ── */}
        {score.actions.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Do this next</p>
            <div className="space-y-3">
              {score.actions.map(a => (
                <div key={a.rank} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{a.rank}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{a.title}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${EASE_STYLE[a.howEasy]}`}>{EASE_LABEL[a.howEasy]}</span>
                      </div>
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

        {/* ── Score → plan recommendation ── */}
        <PlanRecommendation score={score} />

        {/* ── SECTION 6: Save & track ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
          <p className="text-2xl mb-2">🔥</p>
          <p className="font-bold text-gray-900 dark:text-white text-sm">{score.streakDays} day streak</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">Your score is saved on this device. Come back in 30 days to track your progress.</p>
          <button onClick={retake} className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
            Retake the 3 quick questions
          </button>
        </div>

        {/* ── STEP 4: Body details form ── */}
        {bodyOpen && score.level !== 'full' && (
          <div ref={bodyRef} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-1">Body details</p>
            <p className="text-sm text-gray-400 mb-6">Sharpens your Body and Mind score with real numbers.</p>

            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <NumberField label="Age" value={body.age} onChange={v => setBody(b => ({ ...b, age: v }))} min={16} max={90} />
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Weight (kg)" value={body.weight} onChange={v => setBody(b => ({ ...b, weight: v }))} min={30} max={200} />
                <NumberField label="Height (cm)" value={body.height} onChange={v => setBody(b => ({ ...b, height: v }))} min={120} max={220} />
              </div>
            </div>
            <p className="text-xs text-gray-400 -mt-3 mb-6">BMI: <span className="font-bold text-gray-700 dark:text-gray-300">{bmiPreview.toFixed(1)}</span></p>

            <SliderField label="Sleep hours/night" value={body.sleepHours} onChange={v => setBody(b => ({ ...b, sleepHours: v }))}
              min={4} max={10} step={0.5}
              hint={`Optimal: 7-8 hours${sleepCostPreview > 5000 ? ` · costing ≈ ₹${Math.round(sleepCostPreview/1000)}K/yr` : ''}`} />

            <div className="mb-5">
              <label className="calc-label">Exercise days/week</label>
              <div className="grid grid-cols-4 gap-2">
                {EXERCISE_BUCKETS.map(bkt => (
                  <button key={bkt.label} onClick={() => setBody(b => ({ ...b, exerciseDays: bkt.days }))}
                    className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                      Math.abs(body.exerciseDays - bkt.days) < 0.75
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-teal-400'
                    }`}>
                    {bkt.label}
                  </button>
                ))}
              </div>
            </div>

            <SliderField label="Stress level" value={body.stressLevel} onChange={v => setBody(b => ({ ...b, stressLevel: v }))}
              min={1} max={10} step={1}
              hint={`😄 1 · 😊 3 · 😐 5 · 😕 7 · 😤 10${stressCostPreview > 3000 ? ` — high stress costing ≈ ₹${Math.round(stressCostPreview/1000)}K/yr` : ''}`} />

            <div className="mb-5">
              <label className="calc-label">Diet quality</label>
              <div className="grid grid-cols-5 gap-2">
                {DIET_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setBody(b => ({ ...b, dietQuality: opt.value }))}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-[11px] font-bold border-2 transition-all ${
                      body.dietQuality === opt.value
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-teal-400'
                    }`}>
                    <span className="text-lg">{opt.emoji}</span>{opt.label}
                  </button>
                ))}
              </div>
            </div>

            <SliderField label="Water (litres/day)" value={body.waterLiters} onChange={v => setBody(b => ({ ...b, waterLiters: v }))}
              min={0.5} max={4} step={0.25} hint={`Target for your weight: ≈ ${optimalWaterPreview}L`} />

            <button onClick={submitBody}
              className="w-full mt-2 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all">
              Update my score →
            </button>
          </div>
        )}

        {/* ── STEP 5: Finance details form ── */}
        {financeOpen && score.level !== 'full' && (
          <div ref={financeRef} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">Finance details</p>
            <p className="text-sm text-gray-400 mb-6">Unlocks your full Wealth score, health cost in ₹, and life trajectories.</p>

            <SliderField label="Monthly income" value={finance.monthlyIncome} onChange={v => setFinance(f => ({ ...f, monthlyIncome: v }))}
              min={10000} max={500000} step={5000} format={v => `₹${v.toLocaleString('en-IN')}`} />

            <SliderField label="Monthly expenses" value={finance.monthlyExpenses} onChange={v => setFinance(f => ({ ...f, monthlyExpenses: v }))}
              min={0} max={finance.monthlyIncome} step={2500} format={v => `₹${v.toLocaleString('en-IN')}`}
              hint={`You save ${Math.round(savingsRatePreview * 100)}% of income`}
              hintColor={savingsRatePreview > 0.2 ? 'text-green-500' : savingsRatePreview > 0.1 ? 'text-amber-500' : 'text-red-500'} />

            <SliderField label="Total savings" value={finance.totalSavings} onChange={v => setFinance(f => ({ ...f, totalSavings: v }))}
              min={0} max={5000000} step={25000} format={v => `₹${v.toLocaleString('en-IN')}`} />

            <div className="grid grid-cols-2 gap-3 mb-5">
              <TogglePill label="Emergency fund" value={finance.hasEmergencyFund} onChange={v => setFinance(f => ({ ...f, hasEmergencyFund: v }))} />
              <TogglePill label="Insurance" value={finance.hasInsurance} onChange={v => setFinance(f => ({ ...f, hasInsurance: v }))} />
            </div>

            <SliderField label="Total debt" value={finance.totalDebt} onChange={v => setFinance(f => ({ ...f, totalDebt: v }))}
              min={0} max={5000000} step={25000} format={v => `₹${v.toLocaleString('en-IN')}`}
              hint={`Debt-to-income: ${debtToIncomePreview.toFixed(1)}x annual income`} />

            <SliderField label="Monthly investments" value={finance.monthlyInvestments} onChange={v => setFinance(f => ({ ...f, monthlyInvestments: v }))}
              min={0} max={100000} step={1000} format={v => `₹${v.toLocaleString('en-IN')}`}
              hint={finance.monthlyInvestments > 0 ? `≈ ₹${(sipProjectionPreview/100000).toFixed(1)}L in 20 years at 12%` : undefined} />

            <button onClick={submitFinance}
              className="w-full mt-2 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all">
              See my full Life ROI →
            </button>
          </div>
        )}

        {/* ── STEP 7: Share card ── */}
        <ShareCard score={score} />

      </div>
    </div>
  );
}

// ── Presentational pieces ─────────────────────────────────────────────────

function PlanRecommendation({ score }: { score: WellFiScore }) {
  const { planId, reason } = recommendPlan(score);
  const plan = getPlanAny(planId) as Plan | null;
  if (!plan) return null;

  const lowestLabel = planId === 'diet' ? 'body' : planId === 'finance' ? 'finance' : 'body and finance';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-teal-200 dark:border-teal-800 p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-3">💡 Based on your score</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
        Your <span className="font-bold text-gray-900 dark:text-white">{lowestLabel}</span> score needs most attention.
      </p>
      <p className="font-bold text-gray-900 dark:text-white text-base mb-4">
        The {plan.name} is built for exactly your situation.
      </p>

      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">What you get</p>
      <div className="space-y-1.5 mb-4">
        {plan.features.slice(0, 3).map((f, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-teal-500 flex-shrink-0 mt-0.5">→</span>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{f}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mb-4">₹{plan.monthlyPrice}/month · 30-day refund guarantee</p>

      <div className="flex flex-wrap gap-3">
        <Link href={`/plan/${plan.id}`}
          className={`px-5 py-2.5 rounded-xl bg-gradient-to-r ${plan.gradient} text-white font-bold text-sm hover:shadow-lg transition-all`}>
          Get the {plan.name} →
        </Link>
        <Link href="/plan" className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:border-teal-400 transition-all">
          See all plans →
        </Link>
      </div>
      <p className="text-[11px] text-gray-400 mt-3">{reason}</p>
    </div>
  );
}

function RetakeBanner() {
  return (
    <div className="bg-teal-600 text-white text-center text-xs font-semibold py-2">
      Retaking your quick questions will update your score above.
    </div>
  );
}

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
      <div className="grid sm:grid-cols-2 gap-3 mb-5">
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

function HealthCostCard({ score }: { score: WellFiScore }) {
  if (score.annualHealthCost == null) return null;
  return (
    <div className="rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 p-6 text-white">
      <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Your health is costing you</p>
      <p className="text-5xl font-black mb-1">₹{score.annualHealthCost.toLocaleString('en-IN')}<span className="text-lg font-bold text-white/60">/year</span></p>
      {score.lifetimeHealthCost != null && (
        <p className="text-sm text-white/80 mb-4">Over your career: ₹{(score.lifetimeHealthCost/10000000).toFixed(1)} Cr · equivalent SIP: ₹{Math.round(score.annualHealthCost/12).toLocaleString('en-IN')}/month</p>
      )}
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
            <p className="text-lg font-black text-gray-900 dark:text-white">₹{(t.netWorthAt60/10000000).toFixed(2)}Cr</p>
            <p className="text-[10px] text-gray-400 mb-2">Net worth at 60</p>
            <div className="space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
              <p>Life quality: {t.lifeQuality}/10</p>
              <p>Life expectancy: {t.lifeExpectancy}</p>
              <p>Passive income: ₹{t.monthlyPassiveIncome.toLocaleString('en-IN')}/mo</p>
            </div>
            <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">{t.keyChange}</p>
          </div>
        ))}
      </div>
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
    try { await navigator.clipboard.writeText(text); setCopied(which); setTimeout(() => setCopied(null), 2000); } catch {}
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
      <p className="font-bold text-gray-900 dark:text-white mb-1">Share your archetype</p>
      <p className="text-sm text-gray-400 mb-5">{score.archetype.emoji} {score.archetype.name} · {score.overall}/100</p>
      <div className="flex flex-wrap justify-center gap-2.5">
        <button onClick={() => copy(shareText, 'text')}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all">
          {copied === 'text' ? '✓ Copied!' : 'Copy my archetype'}
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-all">
          WhatsApp
        </a>
        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 text-white text-xs font-bold transition-all">
          Twitter / X
        </a>
        <button onClick={() => copy(shareUrl, 'link')}
          className="px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold hover:border-teal-400 transition-all">
          {copied === 'link' ? '✓ Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}

// ── Form controls ──────────────────────────────────────────────────────────

function NumberField({ label, value, onChange, min, max }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number;
}) {
  // Local text buffer so the field doesn't snap to `min` on every keystroke
  // (e.g. clearing "28" to type "16" would otherwise clamp to min mid-type).
  // Clamping only happens on blur, once the user is done editing.
  const [text, setText] = useState(String(value));
  useEffect(() => { setText(String(value)); }, [value]);

  const commit = () => {
    const n = Number(text);
    const clamped = Number.isFinite(n) && text.trim() !== '' ? Math.max(min, Math.min(max, n)) : value;
    setText(String(clamped));
    if (clamped !== value) onChange(clamped);
  };

  return (
    <div>
      <label className="calc-label">{label}</label>
      <input type="number" value={text} min={min} max={max}
        onChange={e => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-teal-500" />
    </div>
  );
}

function SliderField({ label, value, onChange, min, max, step, hint, hintColor, format }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number;
  hint?: string; hintColor?: string; format?: (v: number) => string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-1.5">
        <label className="calc-label mb-0">{label}</label>
        <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{format ? format(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-teal-600" />
      {hint && <p className={`text-xs mt-1.5 ${hintColor ?? 'text-gray-400'}`}>{hint}</p>}
    </div>
  );
}

function TogglePill({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div>
      <p className="calc-label">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(opt => (
          <button key={String(opt.v)} onClick={() => onChange(opt.v)}
            className={`py-2 rounded-lg text-xs font-bold border-2 transition-all ${
              value === opt.v
                ? 'bg-teal-600 border-teal-600 text-white'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-teal-400'
            }`}>
            {opt.l}
          </button>
        ))}
      </div>
    </div>
  );
}
