/**
 * app/score/percentile.ts — estimates "better than X% of people" framing
 * for a Score result.
 *
 * IMPORTANT — HONESTY ABOUT WHAT THIS IS
 * -----------------------------------------
 * There is no real population dataset of past Score results yet (this
 * site has no backend/database — see ROADMAP.md). So this is NOT "you
 * scored better than X% of actual past users." It's a normal-distribution
 * model centered on reasonable assumptions about a general population
 * (mean ~52, stdev ~18, loosely informed by how self-assessment surveys on
 * health/financial wellbeing typically distribute). The UI copy reflects
 * this honestly ("an estimate based on typical patterns") rather than
 * implying real user data backs the number.
 *
 * WHY BUILD THIS NOW ANYWAY
 * ---------------------------
 * Percentile framing is one of the most effective share-triggers for any
 * personal-result feature — "I'm in the top 30%" is more compelling to
 * post than "I scored 68/100." Shipping an honest, clearly-labelled
 * estimate now captures that growth lever immediately. Once there IS real
 * aggregate data (post Layer 3+ accounts, see ROADMAP.md), this function
 * can be swapped for a real percentile computed from actual past scores —
 * the call site (ResultsShare / ShareCard) doesn't need to change, only
 * this file's internals.
 */

/** Standard normal CDF via the Abramowitz-Stegun approximation (no external deps). */
function normalCDF(x: number, mean: number, stdev: number): number {
  const z = (x - mean) / (stdev * Math.SQRT2);
  const t = 1 / (1 + 0.3275911 * Math.abs(z));
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-z * z);
  const erf = z >= 0 ? y : -y;
  return 0.5 * (1 + erf);
}

const MODEL = { mean: 52, stdev: 18 };

/** Returns a percentile 1-99, e.g. 72 means "you scored better than 72% of people." */
export function estimatePercentile(score: number): number {
  const p = normalCDF(score, MODEL.mean, MODEL.stdev) * 100;
  return Math.min(99, Math.max(1, Math.round(p)));
}

export function percentileMessage(score: number): string {
  const p = estimatePercentile(score);
  if (p >= 90) return `Top ${100 - p}% — an exceptional result`;
  if (p >= 50) return `Better than an estimated ${p}% of people`;
  return `Estimated ${p}th percentile — real room to grow, and that's the point of checking`;
}
