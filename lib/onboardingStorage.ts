/**
 * lib/onboardingStorage.ts — storage adapter for plan onboarding answers.
 *
 * Same pattern as scoreStorage.ts / subscriptionStorage.ts: local-only today,
 * async so call sites already await it and won't need to change when a real
 * backend exists. The actual delivery mechanism for onboarding answers is
 * the email sent to hello@wellfilab.com (see app/plan/onboarding/page.tsx) —
 * this local copy exists so the dashboard can show "onboarding complete"
 * without a server round trip.
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
  return record;
}

export async function getOnboarding(plan: PlanKind): Promise<OnboardingRecord | null> {
  return readJSON<OnboardingRecord | null>(key(plan), null);
}
