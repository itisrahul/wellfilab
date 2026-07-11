/**
 * lib/dashboardData.ts — read-only helpers for the /dashboard command centre.
 * All localStorage-backed, framework-agnostic, same "local-only" honesty
 * convention as app/score/trendTracking.ts: every read is wrapped so a
 * missing/corrupted/unavailable localStorage never breaks the page, it just
 * falls back to an empty result the UI renders as an empty state.
 */

export const SCORE_HISTORY_KEY   = 'wfl_score_history_v1';
export const LIFE_ROI_HISTORY_KEY = 'wfl_life_roi_history';
export const SUBSCRIPTION_KEY    = 'wfl_subscription';
export const CALC_HISTORY_KEY    = 'hwt_calc_history';
export const STREAK_KEY          = 'wfl_visit_streak';

// ── Score labelling — shared across dashboard + /life-roi ──────────────────
export function scoreLabel(score: number): 'Excellent' | 'Good' | 'Average' | 'Needs Work' | 'Critical' {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  if (score >= 20) return 'Needs Work';
  return 'Critical';
}

export function scoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#0d9488';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

// ── Score (Health-Wealth) history ───────────────────────────────────────────
export interface ScoreSnapshotLike {
  date: string;
  overall: number;
  health: number;
  wealth: number;
}

export function getScoreHistory(): ScoreSnapshotLike[] {
  if (typeof window === 'undefined') return [];
  return safeParse<ScoreSnapshotLike[]>(window.localStorage.getItem(SCORE_HISTORY_KEY), []);
}

// ── Life ROI history ─────────────────────────────────────────────────────────
export interface LifeROIHistoryEntry {
  date: string;
  healthScore: number;
  financeScore: number;
  lifeROIScore: number;
  insights: { emoji: string; title: string; description: string; type: string; financialValue?: number }[];
  topActions: {
    title: string; description: string; priority: string;
    financialImpact?: number; healthImpact?: string; timeToResult?: string;
    toolLink?: { label: string; url: string };
  }[];
  projections: { label: string; netWorthDelta: number; healthScoreDelta: number }[];
  lifeImpact: string;
  healthCostOfMoney: number;
}

export function getLifeROIHistory(): LifeROIHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  return safeParse<LifeROIHistoryEntry[]>(window.localStorage.getItem(LIFE_ROI_HISTORY_KEY), []);
}

// ── Trend (current vs previous entry in a history array, newest-first or oldest-first both supported) ──
export function trendArrow(current: number | undefined, previous: number | undefined): 'up' | 'down' | 'same' | null {
  if (current == null || previous == null) return null;
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'same';
}

// ── Combined chart data — last 10 points across both histories, merged by date ──
export interface ChartPoint {
  date: string;        // formatted "Jul 11"
  sortKey: number;
  healthWealth?: number;
  lifeROI?: number;
  finance?: number;
}

export function getScoreHistoryChartData(): ChartPoint[] {
  const scoreHist   = getScoreHistory().slice(-10);       // oldest → newest
  const lifeRoiHist = getLifeROIHistory().slice(0, 10).slice().reverse(); // stored newest-first, flip to oldest → newest

  const points = new Map<string, ChartPoint>();

  const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const key = (iso: string) => new Date(iso).toDateString();

  scoreHist.forEach(s => {
    const k = key(s.date);
    const existing = points.get(k) ?? { date: fmt(s.date), sortKey: new Date(s.date).getTime() };
    existing.healthWealth = s.overall;
    points.set(k, existing);
  });

  lifeRoiHist.forEach(l => {
    const k = key(l.date);
    const existing = points.get(k) ?? { date: fmt(l.date), sortKey: new Date(l.date).getTime() };
    existing.lifeROI = l.lifeROIScore;
    existing.finance = l.financeScore;
    points.set(k, existing);
  });

  return Array.from(points.values()).sort((a, b) => a.sortKey - b.sortKey).slice(-10);
}

// ── Subscription (client-side flag only — see /plan for the real Razorpay flow) ──
export interface StoredSubscription {
  planId: 'diet' | 'finance' | 'bundle';
  planName: string;
  status: 'active' | 'trial' | 'cancelled';
  nextBillingDate: string;
  weekNumber: number;
  deliveries: { label: string; date: string; done: boolean }[];
}

export function getSubscription(): StoredSubscription | null {
  if (typeof window === 'undefined') return null;
  return safeParse<StoredSubscription | null>(window.localStorage.getItem(SUBSCRIPTION_KEY), null);
}

// ── Calculator usage history (see components/ui/CalcHistory.tsx for the writer) ──
export interface CalcHistoryEntry {
  id: string;
  calcSlug: string;
  calcName: string;
  summary: string;
  timestamp: number;
}

export function getCalcHistory(): CalcHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  return safeParse<CalcHistoryEntry[]>(window.localStorage.getItem(CALC_HISTORY_KEY), []);
}

export function daysAgo(timestamp: number): string {
  const days = Math.floor((Date.now() - timestamp) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

// ── Visit streak — consecutive calendar days the dashboard has been opened ──
interface StreakRecord {
  lastVisit: string; // ISO date, date-only
  streak: number;
}

export function recordVisitAndGetStreak(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const todayKey = new Date().toDateString();
    const raw = window.localStorage.getItem(STREAK_KEY);
    const record: StreakRecord | null = raw ? JSON.parse(raw) : null;

    if (!record) {
      window.localStorage.setItem(STREAK_KEY, JSON.stringify({ lastVisit: todayKey, streak: 1 }));
      return 1;
    }
    if (record.lastVisit === todayKey) {
      return record.streak;
    }
    const daysSince = Math.round((new Date(todayKey).getTime() - new Date(record.lastVisit).getTime()) / 86400000);
    const nextStreak = daysSince === 1 ? record.streak + 1 : 1;
    window.localStorage.setItem(STREAK_KEY, JSON.stringify({ lastVisit: todayKey, streak: nextStreak }));
    return nextStreak;
  } catch {
    return 0;
  }
}
