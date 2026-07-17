'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getGoals, addGoal, updateGoalProgress, toggleGoalPause, deleteGoal,
  GOAL_TYPE_META, type Goal, type GoalType,
} from '@/lib/goalsStorage';
import { getLatestScore } from '@/lib/scoreStorage';
import type { WellFiScore } from '@/lib/wellfilab-score';

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

function paceLabel(g: Goal): { label: string; tone: 'ahead' | 'behind' | 'ontrack' } | null {
  if (!g.targetDate) return null;
  const start = new Date(g.startDate).getTime();
  const end = new Date(g.targetDate).getTime();
  const now = Date.now();
  if (end <= start || now >= end) return null;
  const timePct = ((now - start) / (end - start)) * 100;
  const actualPct = progressPct(g);
  const diff = actualPct - timePct;
  if (diff > 8) return { label: 'Ahead of schedule', tone: 'ahead' };
  if (diff < -8) return { label: 'Behind schedule', tone: 'behind' };
  return { label: 'On track', tone: 'ontrack' };
}

function estimatedCompletion(g: Goal): string | null {
  const daysSinceStart = Math.max(1, Math.floor((Date.now() - new Date(g.startDate).getTime()) / 86400000));
  const progressed = g.current - g.startValue;
  const remaining = g.target - g.current;
  if (progressed === 0 || Math.sign(progressed) !== Math.sign(g.target - g.startValue)) return null;
  const ratePerDay = progressed / daysSinceStart;
  if (ratePerDay === 0) return null;
  const daysNeeded = remaining / ratePerDay;
  if (daysNeeded <= 0 || !Number.isFinite(daysNeeded) || daysNeeded > 365 * 30) return null;
  const date = new Date(Date.now() + daysNeeded * 86400000);
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

const CATEGORY_STYLE: Record<string, string> = {
  wealth: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
  health: 'bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800',
  score:  'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [score, setScore] = useState<WellFiScore | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    Promise.all([getGoals(), getLatestScore()]).then(([g, s]) => { setGoals(g); setScore(s); });
  }, []);

  const refresh = () => getGoals().then(setGoals);

  const needsUpdate = (goals ?? []).some(g => !g.paused && Date.now() - new Date(g.lastUpdated).getTime() > 25 * 86400000);

  if (goals === null) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-gradient-to-br from-teal-800 to-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {needsUpdate && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <span className="text-lg flex-shrink-0">⏰</span>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex-1">It's been a while since you updated a goal — a quick monthly check-in keeps your progress accurate.</p>
          </div>
        )}

        {showAdd && <AddGoalForm onClose={() => setShowAdd(false)} onAdded={() => { setShowAdd(false); refresh(); }} />}

        {goals.length === 0 && !showAdd ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <p className="text-4xl mb-4">🎯</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No goals yet</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Set a target for your health or wealth and track it every month.</p>
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
            {goals.map(g => <GoalCard key={g.id} goal={g} score={score} onChange={refresh} />)}
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
  const pct = progressPct(goal);
  const complete = isComplete(goal);
  const pace = paceLabel(goal);
  const eta = !complete ? estimatedCompletion(goal) : null;

  const save = async () => { await updateGoalProgress(goal.id, val); onChange(); setEditing(false); };
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

      {eta && <p className="text-[11px] text-gray-400 mb-2">At your current pace: ~{eta}</p>}

      {scoreInsight && !complete && (
        <p className="text-[11px] text-gray-400 mb-2">Your roadmap's "Fix top 3 issues" path projects a monthly passive income of ~{fmtVal(scoreInsight.monthlyPassiveIncome, '₹')} by 60 — <Link href="/roadmap" className="underline hover:text-teal-600">see the actions behind it →</Link></p>
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
        </div>
      )}
    </div>
  );
}

const TYPE_OPTIONS: GoalType[] = ['net-worth', 'sip-target', 'emergency-fund', 'debt-freedom', 'fire-corpus', 'weight', 'sleep', 'fitness', 'hydration', 'wellfilab-score'];

function AddGoalForm({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [type, setType] = useState<GoalType | null>(null);
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
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
          <button onClick={save} disabled={target === '' || current === ''}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 text-white font-bold text-sm transition-all">
            Save goal
          </button>
        </div>
      )}
    </div>
  );
}
