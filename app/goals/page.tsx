'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import {
  getGoals, addGoal, updateGoalProgress, toggleGoalPause, deleteGoal, getGoalHistory,
  GOAL_TYPE_META, type Goal, type GoalType,
} from '@/lib/goalsStorage';
import { estimateGoalETA, getGoalPaceStatus, type GoalPaceStatus } from '@/lib/goalPace';
import { getScoreHistory } from '@/lib/scoreStorage';
import { syncScoreInputsFromAccount } from '@/lib/scoreInputs';
import type { WellFiScore, BodyInputs, FinanceInputs } from '@/lib/wellfilab-score';
import { getScoreFocus, setScoreFocus, type ScoreFocus } from '@/lib/scoreFocus';
import { FocusSelector } from '@/components/dashboard/FocusSelector';
import { buildGoalProgressReport } from '@/lib/goalProgressReport';
import { GoalPathCalculator } from '@/components/dashboard/GoalPathCalculator';
import { AssetTrackerPanel } from '@/components/dashboard/AssetTrackerPanel';
import { SWR_KEYS } from '@/lib/swrKeys';
import { FlowNav } from '@/components/ui/FlowNav';

// recharts is heavy — load it only on the client, same pattern the
// dashboard's trend chart already uses.
const GoalTrendChart = dynamic(
  () => import('@/components/dashboard/GoalTrendChart').then(m => m.GoalTrendChart),
  { ssr: false, loading: () => <div className="h-[140px] animate-pulse bg-gray-50 dark:bg-gray-800/50 rounded-xl" /> }
);

// Lump-sum money goals where "invest X/month, let it compound" is a real
// question — excludes sip-target (already a monthly amount, not a lump
// target), debt-freedom (decreasing, needs payoff math not growth math),
// health/score goals (not monetary), and custom (unknown unit).
const ACCUMULATION_GOAL_TYPES: GoalType[] = ['net-worth', 'emergency-fund', 'fire-corpus', 'home-down-payment', 'education-fund', 'vacation-fund'];

interface SuggestedGoal { type: GoalType; target: number; current: number; reason: string }

function buildSuggestions(score: WellFiScore, body: BodyInputs | null, finance: FinanceInputs | null, existing: Goal[], focus: ScoreFocus): SuggestedGoal[] {
  const has = (t: GoalType) => existing.some(g => g.type === t);
  const suggestions: SuggestedGoal[] = [];
  // 'score' category goals are cross-cutting and stay suggested in either single-focus view.
  const inFocus = (t: GoalType) => focus === 'both' || GOAL_TYPE_META[t].category === focus || GOAL_TYPE_META[t].category === 'score';

  if (!has('wellfilab-score')) {
    suggestions.push({ type: 'wellfilab-score', target: Math.min(100, score.overall + 10), current: score.overall, reason: `You're at ${score.overall}/100 today — a realistic next milestone.` });
  }
  if (finance && !finance.hasEmergencyFund && !has('emergency-fund')) {
    suggestions.push({ type: 'emergency-fund', target: Math.round(finance.monthlyExpenses * 3), current: Math.round(finance.totalSavings), reason: 'No emergency fund yet — 3 months of your real expenses is the standard target.' });
  }
  if (finance && finance.monthlyInvestments < finance.monthlyIncome * 0.1 && !has('sip-target')) {
    suggestions.push({ type: 'sip-target', target: Math.round(Math.max(1000, finance.monthlyIncome * 0.15)), current: Math.round(finance.monthlyInvestments), reason: `You invest ${finance.monthlyIncome > 0 ? Math.round((finance.monthlyInvestments / finance.monthlyIncome) * 100) : 0}% of income today — 15% is a common target.` });
  }
  if (finance && finance.totalDebt > 0 && !has('debt-freedom')) {
    suggestions.push({ type: 'debt-freedom', target: 0, current: Math.round(finance.totalDebt), reason: 'Tracking debt paydown to zero, even slowly, is real visible progress.' });
  }
  if (body && body.sleepHours < 7.5 && !has('sleep')) {
    suggestions.push({ type: 'sleep', target: 7.5, current: body.sleepHours, reason: `You're sleeping ${body.sleepHours}h — 7.5h is the optimal target used in your score.` });
  }
  if (body && body.exerciseDays < 4 && !has('fitness')) {
    suggestions.push({ type: 'fitness', target: 4, current: body.exerciseDays, reason: `${body.exerciseDays} days/week today — 4+ is where the score gives full credit.` });
  }

  return suggestions.filter(s => inFocus(s.type)).slice(0, 3);
}

function fmtVal(n: number, unit: string): string {
  if (unit === '₹' || unit === '₹/month' || unit === '₹ remaining') {
    if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
    if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (Math.abs(n) >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n.toLocaleString('en-IN')}`;
  }
  return `${n.toLocaleString('en-IN')}${unit ? ' ' + unit : ''}`;
}

function progressPct(g: Goal): number {
  const span = g.target - g.startValue;
  if (span === 0) return g.current === g.target ? 100 : 0;
  return Math.max(0, Math.min(100, ((g.current - g.startValue) / span) * 100));
}

function isComplete(g: Goal): boolean {
  const span = g.target - g.startValue;
  if (span === 0) return g.current === g.target;
  return span > 0 ? g.current >= g.target : g.current <= g.target;
}

const PACE_LABEL: Record<GoalPaceStatus, { label: string; tone: 'ahead' | 'behind' | 'ontrack' }> = {
  ahead:      { label: 'Ahead of schedule', tone: 'ahead' },
  behind:     { label: 'Behind schedule',   tone: 'behind' },
  'on-track': { label: 'On track',          tone: 'ontrack' },
};

const CATEGORY_STYLE: Record<string, string> = {
  wealth: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
  health: 'bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800',
  score:  'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
};
const CATEGORY_CHART_COLOR: Record<string, string> = { wealth: '#d97706', health: '#0d9488', score: '#9333ea' };

export default function GoalsPage() {
  const { data: goals, isLoading: goalsLoading, mutate: refresh } = useSWR(SWR_KEYS.goals, getGoals);
  const { data: history } = useSWR(SWR_KEYS.scoreHistory, getScoreHistory);
  const { data: rawInputs } = useSWR(SWR_KEYS.scoreInputs, syncScoreInputsFromAccount);
  const score = history?.[0] ?? null;
  const [showAdd, setShowAdd] = useState(false);
  const [prefill, setPrefill] = useState<{ type: GoalType; current: number; target?: number } | null>(null);
  const [dismissed, setDismissed] = useState<GoalType[]>([]);
  const [focus, setFocus] = useState<ScoreFocus>('both');

  useEffect(() => {
    setFocus(getScoreFocus());
    // Deep link from a calculator's real result, e.g. /goals?prefill=net-worth&current=550000 —
    // read directly from the URL rather than useSearchParams, which would force this
    // otherwise-static page into a Suspense boundary just for this one optional feature.
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('prefill') as GoalType | null;
      const current = params.get('current');
      const target = params.get('target');
      if (type && GOAL_TYPE_META[type] && current != null && !Number.isNaN(+current)) {
        setPrefill({ type, current: +current, target: target != null && !Number.isNaN(+target) ? +target : undefined });
        setShowAdd(true);
      }
    }
  }, []);

  const handleFocusChange = (f: ScoreFocus) => { setFocus(f); setScoreFocus(f); };

  const needsUpdate = (goals ?? []).some(g => !g.paused && Date.now() - new Date(g.lastUpdated).getTime() > 25 * 86400000);
  const suggestions = score
    ? buildSuggestions(score, rawInputs?.body ?? null, rawInputs?.finance ?? null, goals ?? [], focus).filter(s => !dismissed.includes(s.type))
    : [];
  const visibleGoals = (goals ?? []).filter(g => focus === 'both' || GOAL_TYPE_META[g.type].category === focus || GOAL_TYPE_META[g.type].category === 'score');

  const addSuggested = async (s: SuggestedGoal) => {
    await addGoal({ type: s.type, label: GOAL_TYPE_META[s.type].label, target: s.target, current: s.current });
    refresh();
  };

  if (goalsLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-[#0F2A27]">
        <FlowNav current="goals" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-white/5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-300 mb-2">Goal Tracking</p>
              <h1 className="text-3xl font-extrabold text-white mb-2">Your Goals</h1>
              <p className="text-sm text-white/50">Track progress toward what matters most — health and wealth, side by side.</p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm transition-all flex-shrink-0">
              + Add Goal
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        <div className="flex items-center gap-3 flex-wrap text-xs">
          <Link href="/roadmap" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">← Back to your roadmap</Link>
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <Link href="/dashboard" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">See progress on your dashboard →</Link>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-gray-400">Show goals and suggestions for:</p>
          <FocusSelector focus={focus} onChange={handleFocusChange} />
        </div>

        {needsUpdate && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <span className="text-lg flex-shrink-0">⏰</span>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex-1">It's been a while since you updated a goal — a quick monthly check-in keeps your progress accurate.</p>
          </div>
        )}

        {suggestions.length > 0 && !showAdd && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Suggested for you — based on your real score</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {suggestions.map(s => {
                const meta = GOAL_TYPE_META[s.type];
                return (
                  <div key={s.type} className="relative p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <button onClick={() => setDismissed(d => [...d, s.type])} className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 text-xs">✕</button>
                    <span className="text-xl">{meta.icon}</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1.5">{meta.label}</p>
                    <p className="text-xs text-gray-400 mt-1 mb-3 leading-relaxed">{s.reason}</p>
                    <button onClick={() => addSuggested(s)} className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all">
                      + Add this goal
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showAdd && <AddGoalForm onClose={() => setShowAdd(false)} onAdded={() => { setShowAdd(false); refresh(); }} prefill={prefill} />}

        {visibleGoals.length === 0 && !showAdd ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <p className="text-4xl mb-4">🎯</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{goals.length === 0 ? 'No goals yet' : `No ${focus} goals yet`}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {goals.length === 0 ? 'Set a target for your health or wealth and track it every month.' : `Switch focus above, or add a ${focus} goal below.`}
            </p>
            <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all">
              Add your first goal →
            </button>
            <div className="grid sm:grid-cols-3 gap-3 mt-10 max-w-lg mx-auto opacity-40">
              {(['net-worth', 'sleep', 'wellfilab-score'] as GoalType[]).map(t => (
                <div key={t} className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
                  <span className="text-2xl">{GOAL_TYPE_META[t].icon}</span>
                  <p className="text-xs font-semibold text-gray-500 mt-1">{GOAL_TYPE_META[t].label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {visibleGoals.map(g => <GoalCard key={g.id} goal={g} score={score} onChange={refresh} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function GoalCard({ goal, score, onChange }: { goal: Goal; score: WellFiScore | null; onChange: () => void }) {
  const meta = GOAL_TYPE_META[goal.type];
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(goal.current);
  const [justCompleted, setJustCompleted] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const pct = progressPct(goal);
  const complete = isComplete(goal);
  const paceStatus = getGoalPaceStatus(goal);
  const pace = paceStatus ? PACE_LABEL[paceStatus] : null;
  const eta = !complete ? estimateGoalETA(goal) : null;
  // Computed unconditionally (cheap — pure arithmetic on the goal's own
  // history, no I/O) so the recommendation can be the headline, visible
  // by default, not something earned by clicking "Progress report" first.
  const report = buildGoalProgressReport(goal);

  const save = async () => {
    const willComplete = !complete && isComplete({ ...goal, current: val });
    await updateGoalProgress(goal.id, val);
    onChange();
    setEditing(false);
    if (willComplete) { setJustCompleted(true); setTimeout(() => setJustCompleted(false), 4000); }
  };
  const remove = async () => { if (confirm(`Delete "${goal.label}"?`)) { await deleteGoal(goal.id); onChange(); } };
  const pause = async () => { await toggleGoalPause(goal.id); onChange(); };

  const scoreInsight = score && meta.category === 'wealth' && score.trajectories
    ? score.trajectories.find(t => t.scenario === 'improved')
    : null;

  return (
    <div className={`rounded-2xl border p-5 ${goal.paused ? 'opacity-50 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800' : `${CATEGORY_STYLE[meta.category]} bg-white dark:bg-gray-900`}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{goal.label}</p>
            {goal.targetDate && <p className="text-[11px] text-gray-400">Target: {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>}
          </div>
        </div>
        <button onClick={remove} className="text-gray-300 hover:text-red-500 text-sm flex-shrink-0">✕</button>
      </div>

      {justCompleted && (
        <div className="mb-3 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold text-center animate-pulse">
          🎉 Goal reached! Great work.
        </div>
      )}
      <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
        <span>{fmtVal(goal.current, meta.unit)}</span>
        <span>{fmtVal(goal.target, meta.unit)}</span>
      </div>
      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full transition-all duration-700 ${complete ? 'bg-green-500' : 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{complete ? '🎉 Goal reached' : `${Math.round(pct)}% complete`}</p>
        {pace && !complete && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pace.tone === 'ahead' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : pace.tone === 'behind' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{pace.label}</span>
        )}
      </div>

      <div className="mb-3 -mx-1">
        <GoalTrendChart history={getGoalHistory(goal)} target={goal.target} unit={meta.unit} color={CATEGORY_CHART_COLOR[meta.category]} />
      </div>

      {eta && <p className="text-[11px] text-gray-400 mb-2">{eta}</p>}

      {!complete && report.status !== 'no-target' && report.status !== 'not-enough-data' && (
        <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2 mb-2 leading-relaxed">
          💡 {report.recommendation}
        </p>
      )}

      {scoreInsight && !complete && (
        <p className="text-[11px] text-gray-400 mb-2">Your roadmap's "Fix top 3 issues" path projects a monthly passive income of ~{fmtVal(scoreInsight.monthlyPassiveIncome, '₹')} by 60 — <Link href="/roadmap" className="underline hover:text-teal-600">see the actions behind it →</Link></p>
      )}

      {goal.type === 'net-worth' && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <AssetTrackerPanel compact />
        </div>
      )}

      {editing ? (
        <div className="flex gap-2 mt-2">
          <input type="number" value={val} onChange={e => setVal(+e.target.value)}
            className="flex-1 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
          <button onClick={save} className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold">Save</button>
          <button onClick={() => { setEditing(false); setVal(goal.current); }} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500">Cancel</button>
        </div>
      ) : (
        <div className="flex items-center gap-3 mt-1">
          <button onClick={() => setEditing(true)} className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Update progress</button>
          <button onClick={pause} className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">{goal.paused ? 'Resume' : 'Pause'}</button>
          <button onClick={() => setShowReport(s => !s)} className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-auto">
            📊 Advanced progress report {showReport ? '▲' : '▼'}
          </button>
        </div>
      )}

      {showReport && (
        <>
          <GoalProgressReportPanel report={report} meta={meta} />
          {ACCUMULATION_GOAL_TYPES.includes(goal.type) && !complete && (
            <GoalPathCalculator target={goal.target} current={goal.current} targetDate={goal.targetDate} />
          )}
        </>
      )}
    </div>
  );
}

const REPORT_STATUS_STYLE: Record<string, { label: string; color: string }> = {
  ahead:      { label: 'Ahead of pace',   color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
  'on-track': { label: 'On track',        color: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400' },
  behind:     { label: 'Behind pace',     color: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400' },
  'no-target':        { label: 'No target date', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
  'not-enough-data':  { label: 'Not enough data', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
};

function GoalProgressReportPanel({ report, meta }: { report: ReturnType<typeof buildGoalProgressReport>; meta: { unit: string } }) {
  const statusStyle = REPORT_STATUS_STYLE[report.status];

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Advanced progress report</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle.color}`}>{statusStyle.label}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Days elapsed</p>
          <p className="font-mono tabular-nums text-sm font-bold text-gray-900 dark:text-white">{report.daysElapsed}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Days remaining</p>
          <p className="font-mono tabular-nums text-sm font-bold text-gray-900 dark:text-white">{report.daysRemaining ?? '—'}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Your real pace</p>
          <p className="font-mono tabular-nums text-sm font-bold text-gray-900 dark:text-white">
            {report.actualMonthlyPace != null ? `${fmtVal(report.actualMonthlyPace, meta.unit)}/mo` : '—'}
          </p>
        </div>
        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Pace needed</p>
          <p className="font-mono tabular-nums text-sm font-bold text-gray-900 dark:text-white">
            {report.requiredMonthlyPace != null ? `${fmtVal(report.requiredMonthlyPace, meta.unit)}/mo` : '—'}
          </p>
        </div>
      </div>

      {report.monthlyBreakdown.length > 1 && (
        <div className="mb-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Monthly breakdown — real recorded updates</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {report.monthlyBreakdown.slice(-6).map((m, i) => (
              <div key={i} className="flex-shrink-0 min-w-[64px] p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                <p className="text-[9px] text-gray-400">{m.monthLabel}</p>
                <p className="font-mono tabular-nums text-xs font-bold text-gray-900 dark:text-white">{fmtVal(m.value, meta.unit)}</p>
                {m.change != null && (
                  <p className={`font-mono tabular-nums text-[9px] font-bold ${m.change > 0 ? 'text-emerald-600 dark:text-emerald-400' : m.change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {m.change > 0 ? '+' : ''}{fmtVal(m.change, meta.unit)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const TYPE_OPTIONS: GoalType[] = [
  'net-worth', 'sip-target', 'emergency-fund', 'debt-freedom', 'fire-corpus',
  'home-down-payment', 'education-fund', 'vacation-fund',
  'weight', 'sleep', 'fitness', 'hydration', 'steps', 'wellfilab-score',
];

function AddGoalForm({ onClose, onAdded, prefill }: { onClose: () => void; onAdded: () => void; prefill?: { type: GoalType; current: number; target?: number } | null }) {
  const [type, setType] = useState<GoalType | null>(prefill?.type ?? null);
  const [target, setTarget] = useState(prefill?.target != null ? String(prefill.target) : '');
  const [current, setCurrent] = useState(prefill ? String(prefill.current) : '');
  const [targetDate, setTargetDate] = useState('');

  const meta = type ? GOAL_TYPE_META[type] : null;

  const save = async () => {
    if (!type || !meta || target === '' || current === '') return;
    await addGoal({ type, label: meta.label, target: +target, current: +current, targetDate: targetDate || undefined });
    onAdded();
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-gray-900 dark:text-white">Add a goal</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
      </div>

      {!type ? (
        <div className="grid sm:grid-cols-3 gap-2.5">
          {TYPE_OPTIONS.map(t => (
            <button key={t} onClick={() => setType(t)}
              className="p-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-600 text-center transition-all">
              <span className="text-2xl">{GOAL_TYPE_META[t].icon}</span>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1.5">{GOAL_TYPE_META[t].label}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3 max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{meta!.icon}</span>
            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{meta!.label}</p>
            <button onClick={() => setType(null)} className="text-xs text-gray-400 hover:underline ml-auto">Change type</button>
          </div>
          {prefill && (
            <p className="text-[11px] text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20 rounded-lg px-2.5 py-1.5">
              ✓ Current value filled in from your calculator result — just set a target.
            </p>
          )}
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Target ({meta!.unit || 'value'})</label>
            <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="e.g. 10000000"
              className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Current value</label>
            <input type="number" value={current} onChange={e => setCurrent(e.target.value)} placeholder="e.g. 500000"
              className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Target date (optional)</label>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
              className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
          </div>

          {type && ACCUMULATION_GOAL_TYPES.includes(type) && target !== '' && current !== '' && !Number.isNaN(+target) && !Number.isNaN(+current) && +target > +current && (
            <GoalPathCalculator target={+target} current={+current} targetDate={targetDate || undefined} />
          )}

          <button onClick={save} disabled={target === '' || current === ''}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 text-white font-bold text-sm transition-all">
            Save goal
          </button>
        </div>
      )}
    </div>
  );
}
