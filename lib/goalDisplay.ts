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
  'retirement-corpus', 'wedding-fund', 'home-renovation', 'gold-fund', 'business-fund', 'charity-fund',
];

/**
 * Goal types where "how far along am I" genuinely means current/target —
 * you don't start a net-worth or emergency-fund journey at zero the day
 * you happen to set a target in this app, you already have whatever real
 * wealth or score you have. Debt-freedom, monthly-budget, and every health
 * goal are the opposite: real "progress since I started tracking this"
 * types, where the value at creation is the meaningful baseline (you
 * genuinely start a weight-loss goal at today's weight).
 *
 * This also makes raising a target later (updateGoalTarget) behave
 * sanely — without it, editing a ₹90L net-worth goal's target up to ₹2Cr
 * would flash the goal back to "0% complete" even though the ₹90L itself
 * didn't move, because startValue (frozen at goal-creation time) suddenly
 * sits right next to current with almost the entire new span still ahead.
 */
const ABSOLUTE_PROGRESS_TYPES = new Set<GoalType>([
  'net-worth', 'emergency-fund', 'fire-corpus', 'home-down-payment', 'education-fund',
  'vacation-fund', 'vehicle-fund', 'life-insurance-cover', 'credit-score', 'wellfilab-score',
  'retirement-corpus', 'wedding-fund', 'health-insurance-cover', 'tax-saving',
  'home-renovation', 'gold-fund', 'business-fund', 'charity-fund',
]);

/** The real reference point "progress" is measured from — 0 for absolute-
 * target types (see ABSOLUTE_PROGRESS_TYPES), the goal's own recorded
 * startValue for every journey-since-tracking type. */
export function effectiveStartValue(g: Goal): number {
  return ABSOLUTE_PROGRESS_TYPES.has(g.type) ? 0 : g.startValue;
}

export function fmtVal(n: number, unit: string): string {
  if (unit === '₹') return fmtMoney(n, 2);
  if (unit === '₹/month') return `${fmtMoney(n, 2)}/month`;
  if (unit === '₹ remaining') return `${fmtMoney(n, 2)} remaining`;
  return `${n.toLocaleString('en-IN')}${unit ? ' ' + unit : ''}`;
}

export function progressPct(g: Goal): number {
  const start = effectiveStartValue(g);
  const span = g.target - start;
  if (span === 0) return g.current === g.target ? 100 : 0;
  return Math.max(0, Math.min(100, ((g.current - start) / span) * 100));
}

export function isGoalComplete(g: Goal): boolean {
  const start = effectiveStartValue(g);
  const span = g.target - start;
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
