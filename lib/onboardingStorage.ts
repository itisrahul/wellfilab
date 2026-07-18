/**
 * lib/onboardingStorage.ts — storage adapter for plan onboarding answers.
 *
 * Backed by /api/onboarding (Postgres, keyed by Clerk userId + plan) when
 * signed in, with localStorage as an always-on fallback/cache — same
 * pattern as lib/scoreStorage.ts. The actual delivery mechanism for
 * onboarding answers is still the email sent to hello@wellfilab.com (see
 * app/plan/onboarding/page.tsx) — this exists so the dashboard can show
 * "onboarding complete" without a server round trip, and now also so it
 * survives a cleared browser or a different device when signed in.
 */

export type PlanKind = 'diet' | 'finance' | 'bundle';

export interface OnboardingRecord {
  plan: PlanKind;
  email: string;
  answers: Record<string, unknown>;
  submittedAt: string;
}

function key(plan: PlanKind): string {
  return `wfl_onboarding_${plan}`;
}

function readJSON<T>(k: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(k);
    if (!raw) return fallback;
    return JSON.parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(k: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(k, JSON.stringify(value));
  } catch { /* quota exceeded or unavailable — never block the core flow */ }
}

export async function saveOnboarding(record: OnboardingRecord): Promise<OnboardingRecord> {
  writeJSON(key(record.plan), record);
  try { await fetch('/api/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) }); }
  catch { /* signed out, offline, or a server error — local copy above is still saved */ }
  return record;
}

export async function getOnboarding(plan: PlanKind): Promise<OnboardingRecord | null> {
  try {
    const res = await fetch(`/api/onboarding?plan=${plan}`);
    if (res.ok) {
      const { record } = await res.json();
      if (record) return record as OnboardingRecord;
    }
  } catch {
    /* offline, signed out (401), or a server error — fall back to local */
  }
  return readJSON<OnboardingRecord | null>(key(plan), null);
}
