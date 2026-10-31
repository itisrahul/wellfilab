/**
 * lib/goalProbability.ts — "how likely am I to hit this by my target date?"
 *
 * Real statistics on the goal's own recorded history, not a fabricated
 * confidence number. Treats the real monthly rate-of-change between your own
 * logged updates as a sample: its mean projects where you'll land, its
 * variance says how consistent that pace actually is, and a normal
 * approximation turns "need X more by date Y, usually moving at pace Z with
 * this much wobble" into a probability. No external stats library — a
 * well-known closed-form erf approximation for the normal CDF.
 *
 * Deliberately returns a status instead of a number whenever there isn't a
 * real signal yet (no target date, or fewer than 2 real intervals between
 * updates) — an honest "not enough data" beats a confident-looking guess
 * from one or two points. Clamped to [3, 97]% even with a very consistent
 * history — nothing from a small real-world sample should ever be presented
 * as 0% or 100% certain.
 */

import type { Goal } from './goalsStorage';
import { getGoalHistory } from './goalsStorage';

const MIN_HISTORY_POINTS = 3;
const MS_PER_DAY = 86400000;
const MS_PER_MONTH = 30 * MS_PER_DAY;

export type GoalProbability =
  | { status: 'estimated'; pct: number; basis: string }
  | { status: 'no-target' | 'not-enough-data' | 'past-due' };

// Abramowitz & Stegun 7.1.26 — standard normal CDF via the erf approximation,
// max error ~1.5e-7. Good enough for a rough probability band, not a
// precision risk model.
function normalCdf(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - (((((1.061405429 * t) - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

export function estimateGoalProbability(g: Goal): GoalProbability {
  if (!g.targetDate) return { status: 'no-target' };

  const span = g.target - g.startValue;
  if (span === 0) return { status: 'not-enough-data' };

  const history = getGoalHistory(g);
  if (history.length < MIN_HISTORY_POINTS) return { status: 'not-enough-data' };

  // Real per-30-day rate between each pair of consecutive real updates —
  // normalized from the actual day gap, never assumed to be exactly a month.
  const rates: number[] = [];
  for (let i = 1; i < history.length; i++) {
    const days = (new Date(history[i].date).getTime() - new Date(history[i - 1].date).getTime()) / MS_PER_DAY;
    if (days <= 0) continue;
    rates.push(((history[i].value - history[i - 1].value) / days) * 30);
  }
  if (rates.length < 2) return { status: 'not-enough-data' };

  const now = Date.now();
  const monthsLeft = (new Date(g.targetDate).getTime() - now) / MS_PER_MONTH;
  if (monthsLeft <= 0) return { status: 'past-due' };

  const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
  const sampleVariance = rates.reduce((a, b) => a + (b - mean) ** 2, 0) / (rates.length - 1);
  const sd = Math.sqrt(sampleVariance);

  const remaining = g.target - g.current;            // signed: what's still needed, in the goal's own direction
  const projectedChange = mean * monthsLeft;          // expected total change by the target date at the current pace
  const sdOfSum = sd * Math.sqrt(monthsLeft);          // variance scales with time for a sum of independent monthly changes

  let pct: number;
  if (sdOfSum === 0) {
    const willMeet = span > 0 ? projectedChange >= remaining : projectedChange <= remaining;
    pct = willMeet ? 97 : 3;
  } else {
    const z = (remaining - projectedChange) / sdOfSum;
    const p = span > 0 ? 1 - normalCdf(z) : normalCdf(z);
    pct = Math.round(Math.max(3, Math.min(97, p * 100)));
  }

  const spanMonths = Math.max(1, Math.round((new Date(history[history.length - 1].date).getTime() - new Date(history[0].date).getTime()) / MS_PER_MONTH));
  const basis = `Based on ${history.length} real updates over ${spanMonths === 1 ? '~1 month' : `~${spanMonths} months`} — an estimate, not a guarantee.`;

  return { status: 'estimated', pct, basis };
}
