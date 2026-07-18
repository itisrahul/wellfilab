/**
 * lib/goalPace.ts — real pace-based ETA for a goal, no invented dates.
 *
 * Computes "at your current rate of progress, when do you hit target" purely
 * from the goal's own startValue/startDate → current/lastUpdated numbers.
 * Returns null rather than a guess when there isn't enough signal yet
 * (goal just created, or no progress made) — an honest "not enough data"
 * beats a fabricated date.
 */

import type { Goal } from './goalsStorage';

const MIN_DAYS_FOR_PACE = 3;

export function estimateGoalETA(g: Goal): string | null {
  const span = g.target - g.startValue;
  if (span === 0) return null;

  const elapsedDays = (new Date(g.lastUpdated).getTime() - new Date(g.startDate).getTime()) / 86400000;
  if (elapsedDays < MIN_DAYS_FOR_PACE) return null;

  const progressed = g.current - g.startValue;
  const movingRightDirection = span > 0 ? progressed > 0 : progressed < 0;
  if (!movingRightDirection) return null;

  const fractionDone = progressed / span;
  if (fractionDone >= 1) return 'Target reached';

  const ratePerDay = fractionDone / elapsedDays;
  if (ratePerDay <= 0) return null;

  const daysLeft = (1 - fractionDone) / ratePerDay;
  if (!isFinite(daysLeft) || daysLeft <= 0) return 'Target reached';

  const monthsLeft = daysLeft / 30;
  if (monthsLeft < 1) return `~${Math.max(1, Math.round(daysLeft))} days at this pace`;
  if (monthsLeft < 24) return `~${Math.round(monthsLeft)} months at this pace`;
  return `~${(monthsLeft / 12).toFixed(1)} years at this pace`;
}
