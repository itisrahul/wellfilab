/**
 * lib/goalDisplay.ts — shared, pure display helpers for a goal, used by both
 * the goal card grid (app/goals/page.tsx) and a single goal's full-page view
 * (app/goals/[id]/page.tsx) — kept in one place so the two don't drift the
 * way the pace calculation itself once did (see lib/goalPace.ts's history).
 */
import type { Goal, GoalType } from './goalsStorage';
import type { GoalPaceStatus } from './goalPace';
import { fmtMoney } from './currency';

// Lump-sum money goals where "invest X/month, let it compound" is a real
// question — excludes sip-target/monthly-budget (already monthly amounts,
// not lump targets), debt-freedom (decreasing, needs payoff math not
// growth math), life-insurance-cover (a policy you buy, not accumulate),
// credit-score/health/score goals (not monetary), and custom (unknown
// unit). Shared by the goal card grid and the full-page view so the two
// never drift apart on which types get a path calculator.
export const ACCUMULATION_GOAL_TYPES: GoalType[] = [
  'net-worth', 'emergency-fund', 'fire-corpus', 'home-down-payment', 'education-fund', 'vacation-fund', 'vehicle-fund',
];

export function fmtVal(n: number, unit: string): string {
  if (unit === '₹') return fmtMoney(n, 2);
  if (unit === '₹/month') return `${fmtMoney(n, 2)}/month`;
  if (unit === '₹ remaining') return `${fmtMoney(n, 2)} remaining`;
  return `${n.toLocaleString('en-IN')}${unit ? ' ' + unit : ''}`;
}

export function progressPct(g: Goal): number {
  const span = g.target - g.startValue;
  if (span === 0) return g.current === g.target ? 100 : 0;
  return Math.max(0, Math.min(100, ((g.current - g.startValue) / span) * 100));
}

export function isGoalComplete(g: Goal): boolean {
  const span = g.target - g.startValue;
  if (span === 0) return g.current === g.target;
  return span > 0 ? g.current >= g.target : g.current <= g.target;
}

export const PACE_LABEL: Record<GoalPaceStatus, { label: string; tone: 'ahead' | 'behind' | 'ontrack' }> = {
  ahead:      { label: 'Ahead of schedule', tone: 'ahead' },
  behind:     { label: 'Behind schedule',   tone: 'behind' },
  'on-track': { label: 'On track',          tone: 'ontrack' },
};

export const CATEGORY_STYLE: Record<string, string> = {
  wealth: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
  health: 'bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800',
  score:  'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
};
export const CATEGORY_CHART_COLOR: Record<string, string> = { wealth: '#d97706', health: '#0d9488', score: '#9333ea' };
