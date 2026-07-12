/**
 * lib/subscriptionStorage.ts — storage adapter for plan subscription state.
 *
 * Same pattern as lib/scoreStorage.ts: every read/write goes through this
 * file, UI code only ever calls the functions below, never `localStorage`
 * directly. When a real backend + database exists (subscription state truly
 * belongs server-side, keyed by user — a browser-local flag can't reflect a
 * webhook that fires on Razorpay's servers), only this file changes: swap
 * each body for a `fetch('/api/subscription')` call. Every function here is
 * already async so call sites already `await` them.
 *
 * Honesty note: today this is local-only, written at the moment checkout
 * succeeds in *this* browser. It won't reflect payments made on another
 * device, or webhook-driven state changes (e.g. a failed renewal) until a
 * real backend exists. The Razorpay webhook (app/api/webhook/route.ts)
 * already has TODOs marking where server-side persistence plugs in later.
 */

const SUBSCRIPTION_KEY = 'wfl_subscription';

export interface StoredSubscription {
  planId: 'diet' | 'finance' | 'bundle';
  planName: string;
  status: 'active' | 'trial' | 'cancelled';
  /** Razorpay subscription id (sub_xxx) — absent in demo mode. Needed to call the cancel API. */
  subscriptionId?: string;
  nextBillingDate: string;
  weekNumber: number;
  deliveries: { label: string; date: string; done: boolean }[];
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded or unavailable — never block the core flow */
  }
}

export async function getSubscription(): Promise<StoredSubscription | null> {
  return readJSON<StoredSubscription | null>(SUBSCRIPTION_KEY, null);
}

/** Called right after checkout succeeds — records the new subscription locally. */
export async function saveSubscription(sub: StoredSubscription): Promise<StoredSubscription> {
  writeJSON(SUBSCRIPTION_KEY, sub);
  return sub;
}

/**
 * Cancels the Razorpay subscription (if one exists — demo-mode subscriptions
 * have no `subscriptionId` and skip straight to the local update) and marks
 * the local record as cancelled rather than deleting it, so the dashboard
 * can still show "Cancelled" with a resubscribe path instead of reverting to
 * the generic "no plan" empty state.
 */
export async function cancelSubscription(current: StoredSubscription): Promise<StoredSubscription> {
  // `current` comes from the caller rather than a local re-read: the dashboard's
  // authoritative copy may be the account (Clerk) version, which this browser's
  // localStorage was never told about — re-reading local here would silently
  // no-op the cancel for exactly the cross-device case this system exists for.
  if (current.subscriptionId) {
    try {
      await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: current.subscriptionId }),
      });
    } catch {
      /* network failure — still reflect cancellation locally rather than trap the user */
    }
  }

  const updated: StoredSubscription = { ...current, status: 'cancelled' };
  writeJSON(SUBSCRIPTION_KEY, updated);
  await syncSubscriptionToAccount(updated);
  return updated;
}

export async function clearSubscription(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SUBSCRIPTION_KEY);
  } catch { /* noop */ }
}

// ── Account sync (app/api/subscription — Clerk-backed, the real source of truth) ──

/** Best-effort: writes to the signed-in user's account. No-ops (but logs) if not signed in or the call fails. */
export async function syncSubscriptionToAccount(sub: StoredSubscription): Promise<void> {
  try {
    const res = await fetch('/api/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error('syncSubscriptionToAccount failed:', res.status, body);
    }
  } catch (err) {
    console.error('syncSubscriptionToAccount network error:', err);
  }
}

/** Returns null both when signed out and when the account has no subscription. */
export async function getAccountSubscription(): Promise<StoredSubscription | null> {
  try {
    const res = await fetch('/api/subscription');
    if (!res.ok) return null; // 401 (signed out) is expected here — not an error
    const data = await res.json();
    return data.subscription ?? null;
  } catch (err) {
    console.error('getAccountSubscription network error:', err);
    return null;
  }
}
