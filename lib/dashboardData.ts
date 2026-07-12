/**
 * lib/dashboardData.ts — read-only helpers for /dashboard that aren't part
 * of the WellFiLab Score system itself. Score data comes from
 * lib/scoreStorage.ts, subscription data from lib/subscriptionStorage.ts;
 * this file covers what's left: calculator usage history.
 */

export const CALC_HISTORY_KEY = 'hwt_calc_history';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
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
