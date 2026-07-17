/**
 * lib/goalsStorage.ts — storage adapter for the Goals system.
 *
 * Same pattern as lib/scoreStorage.ts / lib/subscriptionStorage.ts / lib/onboardingStorage.ts:
 * every read/write to localStorage for goals goes through this file, functions are already
 * async so a future real backend only needs new function bodies here, not new call sites.
 *
 * Honesty note: local-only today — clearing browser data or switching devices loses goals.
 */

export type GoalType =
  | 'net-worth' | 'sip-target' | 'emergency-fund' | 'debt-freedom' | 'fire-corpus'
  | 'weight' | 'sleep' | 'fitness' | 'hydration'
  | 'wellfilab-score' | 'custom';

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

export async function getGoals(): Promise<Goal[]> {
  return readGoals();
}

export async function addGoal(input: { type: GoalType; label: string; target: number; current: number; targetDate?: string }): Promise<Goal> {
  const now = new Date().toISOString();
  const goal: Goal = {
    id: genId(), type: input.type, label: input.label, target: input.target,
    current: input.current, startValue: input.current, startDate: now,
    targetDate: input.targetDate, lastUpdated: now,
  };
  writeGoals([...readGoals(), goal]);
  return goal;
}

export async function updateGoalProgress(id: string, current: number): Promise<void> {
  writeGoals(readGoals().map(g => g.id === id ? { ...g, current, lastUpdated: new Date().toISOString() } : g));
}

export async function toggleGoalPause(id: string): Promise<void> {
  writeGoals(readGoals().map(g => g.id === id ? { ...g, paused: !g.paused } : g));
}

export async function deleteGoal(id: string): Promise<void> {
  writeGoals(readGoals().filter(g => g.id !== id));
}
