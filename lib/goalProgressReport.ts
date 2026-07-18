/**
 * lib/goalProgressReport.ts — the advanced per-goal progress report.
 *
 * Example the whole module is built around: a ₹1 crore goal, 5 years out.
 * "58% there" is a start; this answers the actual questions that matter —
 * what's my real monthly pace, what pace do I actually need to hit the
 * target on time, and by how much am I short (or ahead)? Every number here
 * is arithmetic on the goal's own real history and target date — nothing
 * modeled, nothing assumed, no invented compounding return.
 */

import { getGoalHistory, type Goal } from './goalsStorage';

export interface MonthlyBreakdownPoint {
  monthLabel: string;
  value: number;
  change: number | null; // vs. the previous real data point, null for the first
}

export interface GoalProgressReport {
  pctComplete: number;
  daysElapsed: number;
  daysRemaining: number | null; // null when there's no targetDate to count down to
  /** Real average rate of change per month, from the goal's own history. */
  actualMonthlyPace: number | null;
  /** What the monthly rate would need to be, from today, to hit the target
   * by the target date. Null when there's no targetDate. */
  requiredMonthlyPace: number | null;
  /** requiredMonthlyPace − actualMonthlyPace. Positive means "need more per
   * month than you're currently averaging"; negative or zero means your
   * current pace already clears the bar. Null when either side is null. */
  monthlyGap: number | null;
  status: 'ahead' | 'on-track' | 'behind' | 'no-target' | 'not-enough-data';
  monthlyBreakdown: MonthlyBreakdownPoint[];
  recommendation: string;
}

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

/** Real history points bucketed to one-per-month (last point of each month
 * kept), so a goal updated several times in one month doesn't produce a
 * noisy breakdown — still every value is a real recorded point, never interpolated. */
function bucketByMonth(history: { date: string; value: number }[]): MonthlyBreakdownPoint[] {
  const byMonth = new Map<string, { date: string; value: number }>();
  for (const point of history) {
    const key = point.date.slice(0, 7); // YYYY-MM
    byMonth.set(key, point); // later points in the same month overwrite — keeps the last real value
  }
  const ordered = [...byMonth.values()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return ordered.map((p, i) => ({
    monthLabel: monthLabel(p.date),
    value: p.value,
    change: i === 0 ? null : Math.round((p.value - ordered[i - 1].value) * 100) / 100,
  }));
}

export function buildGoalProgressReport(g: Goal): GoalProgressReport {
  const history = getGoalHistory(g);
  const monthlyBreakdown = bucketByMonth(history);

  const span = g.target - g.startValue;
  const pctComplete = span === 0
    ? (g.current === g.target ? 100 : 0)
    : Math.max(0, Math.min(100, ((g.current - g.startValue) / span) * 100));

  const now = Date.now();
  const startTime = new Date(g.startDate).getTime();
  const daysElapsed = Math.max(0, Math.floor((now - startTime) / 86400000));

  const daysRemaining = g.targetDate
    ? Math.floor((new Date(g.targetDate).getTime() - now) / 86400000)
    : null;

  // Real average pace: total real movement over the real time it took,
  // using the full history log (not just start→now), so a goal with several
  // real check-ins gets a pace reflecting the whole recorded trend.
  const first = history[0];
  const last = history[history.length - 1];
  const spanDays = (new Date(last.date).getTime() - new Date(first.date).getTime()) / 86400000;
  const MIN_DAYS_FOR_PACE = 3;
  const actualMonthlyPace = spanDays >= MIN_DAYS_FOR_PACE
    ? ((last.value - first.value) / spanDays) * 30
    : null;

  const requiredMonthlyPace = (g.targetDate && daysRemaining != null && daysRemaining > 0)
    ? ((g.target - g.current) / daysRemaining) * 30
    : null;

  const monthlyGap = (requiredMonthlyPace != null && actualMonthlyPace != null)
    ? requiredMonthlyPace - actualMonthlyPace
    : null;

  let status: GoalProgressReport['status'];
  if (!g.targetDate) status = 'no-target';
  else if (actualMonthlyPace == null) status = 'not-enough-data';
  else if (monthlyGap == null) status = 'not-enough-data';
  else if (pctComplete >= 100) status = 'ahead';
  else if (monthlyGap > (Math.abs(span) * 0.01)) status = 'behind'; // needs a meaningfully faster pace than current
  else if (monthlyGap < -(Math.abs(span) * 0.01)) status = 'ahead';
  else status = 'on-track';

  const recommendation = buildRecommendation(g, status, monthlyGap, requiredMonthlyPace, daysRemaining);

  return { pctComplete, daysElapsed, daysRemaining, actualMonthlyPace, requiredMonthlyPace, monthlyGap, status, monthlyBreakdown, recommendation };
}

function buildRecommendation(
  g: Goal, status: GoalProgressReport['status'], monthlyGap: number | null,
  requiredMonthlyPace: number | null, daysRemaining: number | null
): string {
  const isMoney = g.type !== 'wellfilab-score' && g.type !== 'sleep' && g.type !== 'fitness' && g.type !== 'hydration' && g.type !== 'weight';
  const fmt = (n: number) => isMoney ? fmtNumberINR(Math.abs(n)) : `${Math.abs(n).toFixed(1)}`;

  switch (status) {
    case 'no-target':
      return 'Add a target date to this goal to get a real required-pace calculation and a monthly progress report.';
    case 'not-enough-data':
      return 'Update this goal a couple more times to unlock a real pace-based recommendation — one data point isn\'t enough to trust a trend yet.';
    case 'ahead':
      return `You're ahead of the pace you actually need. At your current real rate, you're on track to reach this goal before ${g.targetDate ? new Date(g.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'your target date'}.`;
    case 'on-track':
      return `Your current pace matches what's needed — keep it up and you'll hit this goal on time.`;
    case 'behind':
      if (monthlyGap != null && requiredMonthlyPace != null) {
        return `You need about ${fmt(requiredMonthlyPace)}/month to hit this on time — roughly ${fmt(monthlyGap)}/month more than your current real average. ${daysRemaining != null && daysRemaining < 365 ? 'Time is getting tight — consider increasing your monthly contribution now.' : 'There\'s still runway to close this gap gradually.'}`;
      }
      return 'Your current pace is behind what\'s needed to hit this goal on time.';
    default:
      return '';
  }
}

function fmtNumberINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}
