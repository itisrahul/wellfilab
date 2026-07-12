/**
 * lib/dashboardData.ts — read-only helpers for /dashboard that aren't part
 * of the WellFiLab Score system itself. Score data comes from
 * lib/scoreStorage.ts; this file covers the account-adjacent bits: plan
 * subscription status and calculator usage history.
 */

export const SUBSCRIPTION_KEY = 'wfl_subscription';
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
