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
  | 'home-down-payment' | 'education-fund' | 'vacation-fund' | 'vehicle-fund'
  | 'life-insurance-cover' | 'credit-score' | 'monthly-budget'
  | 'weight' | 'sleep' | 'fitness' | 'hydration' | 'steps' | 'body-fat' | 'screen-time'
  | 'wellfilab-score' | 'custom';

export interface GoalHistoryPoint { date: string; value: number }

export type GoalPriority = 'low' | 'medium' | 'high';

/** A real sub-target the user set on the way to the full goal — e.g. "₹25L
 * by Dec 2026" on the way to a ₹1Cr net-worth goal. Marked achieved by the
 * user, never auto-inferred from current crossing the value (crossing it on
 * the way to a later milestone, or on a down-swing, shouldn't silently tick
 * it off). */
export interface GoalMilestone {
  id: string;
  label: string;
  value: number;
  targetDate?: string;
  achievedDate?: string;
}

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
  /** User-set importance — purely a sort/filter signal, never fed into the
   * progress or probability math. Defaults to 'medium' server-side. */
  priority?: GoalPriority;
  /** Real sub-targets on the way to the goal, user-defined and user-marked. */
  milestones?: GoalMilestone[];
  notes?: string;
}

export const GOAL_TYPE_META: Record<GoalType, { label: string; icon: string; unit: string; category: 'wealth' | 'health' | 'score' }> = {
  'net-worth':       { label: 'Net worth target',    icon: '🎯', unit: '₹',        category: 'wealth' },
  'sip-target':      { label: 'Monthly SIP target',  icon: '📈', unit: '₹/month',  category: 'wealth' },
  'emergency-fund':  { label: 'Emergency fund',      icon: '🏦', unit: '₹',        category: 'wealth' },
  'debt-freedom':    { label: 'Debt freedom',        icon: '💳', unit: '₹ remaining', category: 'wealth' },
  'fire-corpus':     { label: 'FIRE corpus',         icon: '🔥', unit: '₹',        category: 'wealth' },
  'home-down-payment': { label: 'Home down payment', icon: '🏠', unit: '₹',       category: 'wealth' },
  'education-fund':  { label: 'Education fund',      icon: '🎓', unit: '₹',        category: 'wealth' },
  'vacation-fund':   { label: 'Vacation fund',       icon: '✈️', unit: '₹',        category: 'wealth' },
  'vehicle-fund':    { label: 'Vehicle purchase fund', icon: '🚗', unit: '₹',      category: 'wealth' },
  'life-insurance-cover': { label: 'Life insurance cover', icon: '🛡️', unit: '₹', category: 'wealth' },
  'credit-score':    { label: 'Credit score target',  icon: '📊', unit: 'pts',    category: 'wealth' },
  'monthly-budget':  { label: 'Monthly expense budget', icon: '💸', unit: '₹/month', category: 'wealth' },
  'weight':          { label: 'Weight target',       icon: '⚖️', unit: 'kg',       category: 'health' },
  'sleep':           { label: 'Sleep target',        icon: '😴', unit: 'hrs/night', category: 'health' },
  'fitness':         { label: 'Fitness target',      icon: '🏃', unit: 'days/week', category: 'health' },
  'hydration':       { label: 'Hydration',           icon: '💧', unit: 'L/day',    category: 'health' },
  'steps':           { label: 'Daily steps',         icon: '👟', unit: 'steps/day', category: 'health' },
  'body-fat':        { label: 'Body fat %',          icon: '📉', unit: '%',        category: 'health' },
  'screen-time':     { label: 'Screen time',         icon: '📱', unit: 'hrs/day',  category: 'health' },
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

/** Set whenever a remote goals call falls back to local-only storage, so
 * the UI can show *why* instead of a silent, unexplained "it didn't save" —
 * same pattern as lib/holdingsStorage.ts's getHoldingsSyncError. */
let lastGoalsSyncError: string | null = null;
export function getGoalsSyncError(): string | null { return lastGoalsSyncError; }

async function describeGoalFailure(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body?.error ? `${body.error}${body.detail ? ` (${body.detail})` : ''}` : `Server returned ${res.status}`;
  } catch {
    return `Server returned ${res.status}`;
  }
}

export async function getGoals(): Promise<Goal[]> {
  try {
    const res = await fetch('/api/goals');
    if (res.ok) {
      lastGoalsSyncError = null;
      const { goals } = await res.json();
      return goals as Goal[];
    }
    if (res.status === 401) { lastGoalsSyncError = null; } // signed out — local-only is expected
    else lastGoalsSyncError = await describeGoalFailure(res);
  } catch (err) {
    lastGoalsSyncError = err instanceof Error ? `Network error: ${err.message}` : 'Network error';
  }
  return readGoals();
}

export async function addGoal(input: { type: GoalType; label: string; target: number; current: number; targetDate?: string; priority?: GoalPriority; notes?: string }): Promise<Goal> {
  try {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) { lastGoalsSyncError = await describeGoalFailure(res); throw new Error('create failed'); }
    lastGoalsSyncError = null;
    const { goal } = await res.json();
    writeGoals([...readGoals(), goal]);
    return goal as Goal;
  } catch (err) {
    if (!lastGoalsSyncError) lastGoalsSyncError = err instanceof Error ? `Network error: ${err.message}` : 'Network error';
    // Signed out, offline, or a server error — create locally so nothing is lost.
    const now = new Date().toISOString();
    const goal: Goal = {
      id: genId(), type: input.type, label: input.label, target: input.target,
      current: input.current, startValue: input.current, startDate: now,
      targetDate: input.targetDate, lastUpdated: now,
      history: [{ date: now, value: input.current }],
      priority: input.priority ?? 'medium', notes: input.notes,
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
    lastGoalsSyncError = res.ok ? null : await describeGoalFailure(res);
  } catch (err) {
    /* signed out, offline, or a goal not yet synced to the account — local write below still applies */
    lastGoalsSyncError = err instanceof Error ? `Network error: ${err.message}` : 'Network error';
  }

  const now = new Date().toISOString();
  writeGoals(readGoals().map(g => g.id === id
    ? { ...g, current, lastUpdated: now, history: [...(g.history ?? [{ date: g.startDate, value: g.startValue }]), { date: now, value: current }] }
    : g));
}

/** Edits the goal's target itself (and/or its target date) — distinct from
 * updateGoalProgress, which logs a real progress update instead. Doesn't
 * touch current/history, so correcting a target you mistyped, or a target
 * date that moved, never fabricates a fake progress point. */
export async function updateGoalTarget(id: string, target: number, targetDate?: string): Promise<void> {
  try {
    await fetch(`/api/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, targetDate: targetDate ?? null }),
    });
  } catch { /* best-effort — local write below still applies */ }

  writeGoals(readGoals().map(g => g.id === id ? { ...g, target, targetDate } : g));
}

/** Priority, notes, and the full milestone list — grouped into one call
 * since all three are plain metadata edited from the same "edit details"
 * form, never auto-derived from progress updates. Pass only the fields
 * that changed; omitted ones are left as-is both server- and client-side. */
export async function updateGoalDetails(id: string, patch: { priority?: GoalPriority; notes?: string; milestones?: GoalMilestone[] }): Promise<void> {
  try {
    await fetch(`/api/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
  } catch { /* best-effort — local write below still applies */ }

  writeGoals(readGoals().map(g => g.id === id ? { ...g, ...patch } : g));
}

/** Adds one milestone with a fresh id — the common case (append), so callers
 * don't have to read the current list back just to push one entry. */
export async function addMilestone(goal: Goal, label: string, value: number, targetDate?: string): Promise<void> {
  const milestone: GoalMilestone = { id: genId(), label, value, targetDate };
  await updateGoalDetails(goal.id, { milestones: [...(goal.milestones ?? []), milestone] });
}

/** Marks a milestone achieved (or un-marks it) — a real user action, never
 * auto-ticked when `current` happens to cross the milestone's value. */
export async function setMilestoneAchieved(goal: Goal, milestoneId: string, achieved: boolean): Promise<void> {
  const now = new Date().toISOString();
  const milestones = (goal.milestones ?? []).map(m => m.id === milestoneId ? { ...m, achievedDate: achieved ? now : undefined } : m);
  await updateGoalDetails(goal.id, { milestones });
}

export async function removeMilestone(goal: Goal, milestoneId: string): Promise<void> {
  await updateGoalDetails(goal.id, { milestones: (goal.milestones ?? []).filter(m => m.id !== milestoneId) });
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
  try {
    const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
    lastGoalsSyncError = res.ok ? null : await describeGoalFailure(res);
  } catch (err) {
    lastGoalsSyncError = err instanceof Error ? `Network error: ${err.message}` : 'Network error';
  }
  writeGoals(readGoals().filter(g => g.id !== id));
}

/** Real history for a goal — the actual log if one exists, or a synthesized
 * 2-point start→current line for goals saved before history was tracked.
 * Never fabricates intermediate points that weren't actually recorded. */
export function getGoalHistory(g: Goal): GoalHistoryPoint[] {
  if (g.history && g.history.length > 0) return g.history;
  return [{ date: g.startDate, value: g.startValue }, { date: g.lastUpdated, value: g.current }];
}
