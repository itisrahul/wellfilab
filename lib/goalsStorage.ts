/**
 * lib/goalsStorage.ts — storage adapter for the Goals system.
 *
 * Backed by /api/goals (Postgres, keyed by Clerk userId) when signed in,
 * with localStorage as an always-on fallback/cache — same pattern as
 * lib/scoreStorage.ts. Every write mirrors to localStorage regardless of
 * whether the remote call succeeded, so the fallback view never drifts from
 * what the account store has, and a goal created while signed out (or
 * offline) still works exactly as before.
 */

export type GoalType =
  | 'net-worth' | 'sip-target' | 'emergency-fund' | 'debt-freedom' | 'fire-corpus'
  | 'weight' | 'sleep' | 'fitness' | 'hydration'
  | 'wellfilab-score' | 'custom';

export interface GoalHistoryPoint { date: string; value: number }

export interface Goal {
  id: string;
  type: GoalType;
  label: string;
  target: number;
  current: number;
  /** Value when the goal was created — lets progress% work regardless of whether the
   * goal moves up (net worth) or down (debt, weight loss) without a separate direction field. */
  startValue: number;
  startDate: string;
  targetDate?: string;
  lastUpdated: string;
  paused?: boolean;
  /** Every real update, in order — powers the Goal Progress Report's actual
   * monthly pace and the History page's per-goal trend. Optional because
   * goals saved before this field existed don't have it; getGoalHistory()
   * below synthesizes a 2-point history (start → current) for those instead
   * of crashing or inventing points that were never actually recorded. */
  history?: GoalHistoryPoint[];
}

export const GOAL_TYPE_META: Record<GoalType, { label: string; icon: string; unit: string; category: 'wealth' | 'health' | 'score' }> = {
  'net-worth':       { label: 'Net worth target',    icon: '🎯', unit: '₹',        category: 'wealth' },
  'sip-target':      { label: 'Monthly SIP target',  icon: '📈', unit: '₹/month',  category: 'wealth' },
  'emergency-fund':  { label: 'Emergency fund',      icon: '🏦', unit: '₹',        category: 'wealth' },
  'debt-freedom':    { label: 'Debt freedom',        icon: '💳', unit: '₹ remaining', category: 'wealth' },
  'fire-corpus':     { label: 'FIRE corpus',         icon: '🔥', unit: '₹',        category: 'wealth' },
  'weight':          { label: 'Weight target',       icon: '⚖️', unit: 'kg',       category: 'health' },
  'sleep':           { label: 'Sleep target',        icon: '😴', unit: 'hrs/night', category: 'health' },
  'fitness':         { label: 'Fitness target',      icon: '🏃', unit: 'days/week', category: 'health' },
  'hydration':       { label: 'Hydration',           icon: '💧', unit: 'L/day',    category: 'health' },
  'wellfilab-score': { label: 'WellFiLab Score target', icon: '⭐', unit: 'pts',   category: 'score' },
  custom:            { label: 'Custom goal',         icon: '🎯', unit: '',         category: 'wealth' },
};

const KEY = 'wfl_goals';

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readGoals(): Goal[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeGoals(goals: Goal[]): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(goals)); } catch { /* quota exceeded — non-critical */ }
}

/** Local-only read, bypassing the remote-first fallback below — used by the
 * one-time import flow (lib/accountImport.ts). */
export function getLocalGoals(): Goal[] {
  return readGoals();
}

export async function getGoals(): Promise<Goal[]> {
  try {
    const res = await fetch('/api/goals');
    if (res.ok) {
      const { goals } = await res.json();
      return goals as Goal[];
    }
  } catch {
    /* offline, signed out (401), or a server error — fall back to local */
  }
  return readGoals();
}

export async function addGoal(input: { type: GoalType; label: string; target: number; current: number; targetDate?: string }): Promise<Goal> {
  try {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`create failed: ${res.status}`);
    const { goal } = await res.json();
    writeGoals([...readGoals(), goal]);
    return goal as Goal;
  } catch {
    // Signed out, offline, or a server error — create locally so nothing is lost.
    const now = new Date().toISOString();
    const goal: Goal = {
      id: genId(), type: input.type, label: input.label, target: input.target,
      current: input.current, startValue: input.current, startDate: now,
      targetDate: input.targetDate, lastUpdated: now,
      history: [{ date: now, value: input.current }],
    };
    writeGoals([...readGoals(), goal]);
    return goal;
  }
}

export async function updateGoalProgress(id: string, current: number): Promise<void> {
  try {
    const res = await fetch(`/api/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current }),
    });
    if (!res.ok) throw new Error(`update failed: ${res.status}`);
  } catch {
    /* signed out, offline, or a goal not yet synced to the account — local write below still applies */
  }

  const now = new Date().toISOString();
  writeGoals(readGoals().map(g => g.id === id
    ? { ...g, current, lastUpdated: now, history: [...(g.history ?? [{ date: g.startDate, value: g.startValue }]), { date: now, value: current }] }
    : g));
}

export async function toggleGoalPause(id: string): Promise<void> {
  const existing = readGoals();
  const target = existing.find(g => g.id === id);
  if (!target) return;
  const paused = !target.paused;

  try {
    await fetch(`/api/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paused }),
    });
  } catch { /* best-effort — local write below still applies */ }

  writeGoals(existing.map(g => g.id === id ? { ...g, paused } : g));
}

export async function deleteGoal(id: string): Promise<void> {
  try { await fetch(`/api/goals/${id}`, { method: 'DELETE' }); } catch { /* best-effort */ }
  writeGoals(readGoals().filter(g => g.id !== id));
}

/** Real history for a goal — the actual log if one exists, or a synthesized
 * 2-point start→current line for goals saved before history was tracked.
 * Never fabricates intermediate points that weren't actually recorded. */
export function getGoalHistory(g: Goal): GoalHistoryPoint[] {
  if (g.history && g.history.length > 0) return g.history;
  return [{ date: g.startDate, value: g.startValue }, { date: g.lastUpdated, value: g.current }];
}
