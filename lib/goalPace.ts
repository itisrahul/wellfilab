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

export type GoalPaceStatus = 'ahead' | 'on-track' | 'behind';

/**
 * Compares the fraction of the goal actually completed against the fraction
 * that *should* be complete by now, given the goal's own target date — real
 * arithmetic on the user's own numbers, not a guess. Returns null whenever
 * there isn't a target date to compare against, or not enough real movement
 * yet to trust a verdict (same MIN_DAYS_FOR_PACE gate as estimateGoalETA).
 */
export function getGoalPaceStatus(g: Goal): GoalPaceStatus | null {
  if (!g.targetDate) return null;
  const span = g.target - g.startValue;
  if (span === 0) return null;

  const elapsedDays = (new Date(g.lastUpdated).getTime() - new Date(g.startDate).getTime()) / 86400000;
  if (elapsedDays < MIN_DAYS_FOR_PACE) return null;

  const progressed = g.current - g.startValue;
  const movingRightDirection = span > 0 ? progressed > 0 : progressed < 0;
  if (!movingRightDirection) return 'behind';

  const fractionDone = progressed / span;
  if (fractionDone >= 1) return 'ahead';

  const totalDays = (new Date(g.targetDate).getTime() - new Date(g.startDate).getTime()) / 86400000;
  if (totalDays <= 0) return null;

  const requiredFractionByNow = Math.min(1, elapsedDays / totalDays);
  const gap = fractionDone - requiredFractionByNow;

  if (gap > 0.05) return 'ahead';
  if (gap < -0.05) return 'behind';
  return 'on-track';
}
