/**
 * lib/scoreInputs.ts — the raw BodyInputs/FinanceInputs behind a saved score.
 *
 * saveScore() (lib/scoreStorage.ts) only persists the computed WellFiScore, not
 * the inputs that produced it — but the score, roadmap, goals and dashboard pages
 * all need those real numbers (income, sleep hours, savings...) to compute
 * genuine, non-generic content. Originally a page-local companion key duplicated
 * across three files; consolidated here once a fourth consumer (the dashboard)
 * needed the same read, since a fourth copy-paste would be one too many.
 *
 * body is nullable — a genuine Wealth-only intake (see calculateWealthOnlyScore)
 * never collects a real BodyInputs, and saving a fabricated one just to fill the
 * shape would be exactly the "fake data presented as real" problem this app has
 * spent real effort removing elsewhere. Consumers already read this optionally
 * (`rawInputs?.body ?? null`), so this stays a low-risk, additive change.
 *
 * saveRawInputs/loadRawInputs/saveAge/loadAge stay synchronous and local-only
 * — all are called as direct values (`setRawInputs(loadRawInputs())`, inline
 * in event handlers) across app/score, app/goals, app/roadmap, and the
 * dashboard, which can't await a network round trip. Sync to /api/score-inputs
 * (Postgres, keyed by Clerk userId) happens best-effort in the background
 * instead: fire-and-forget on every save, plus syncScoreInputsFromAccount()
 * for callers that want to pull the account's copy in on mount.
 */

import type { BodyInputs, FinanceInputs } from './wellfilab-score';

const INPUTS_KEY = 'wfl_score_inputs_v1';
const AGE_KEY = 'wfl_known_age';

function syncToAccount(body: { body?: BodyInputs | null; finance?: FinanceInputs; age?: number }): void {
  fetch('/api/score-inputs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => { /* offline or signed out — local copy is still authoritative for this device */ });
}

export function saveRawInputs(body: BodyInputs | null, finance: FinanceInputs): void {
  try {
    window.localStorage.setItem(INPUTS_KEY, JSON.stringify({ body, finance }));
    if (body?.age != null) saveAge(body.age);
  } catch { /* noop */ }
  syncToAccount({ body, finance });
}

export function loadRawInputs(): { body: BodyInputs | null; finance: FinanceInputs } | null {
  try {
    const raw = window.localStorage.getItem(INPUTS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** A real age, once known, is useful (net-worth benchmarking, risk-allocation
 * hints) even for a Wealth-only user who never gave a full BodyInputs — saved
 * separately so those features work without fabricating the rest of a body. */
export function saveAge(age: number): void {
  try { window.localStorage.setItem(AGE_KEY, String(age)); } catch { /* noop */ }
  syncToAccount({ age });
}

export function loadAge(): number | null {
  try {
    const raw = window.localStorage.getItem(AGE_KEY);
    return raw ? Number(raw) : null;
  } catch { return null; }
}

/** Pulls the signed-in account's score inputs and merges them into the
 * local copy (account wins when present, since it's the cross-device
 * source of truth). No-ops silently when signed out, offline, or the
 * account simply has nothing saved yet. */
export async function syncScoreInputsFromAccount(): Promise<{ body: BodyInputs | null; finance: FinanceInputs } | null> {
  try {
    const res = await fetch('/api/score-inputs');
    if (!res.ok) return loadRawInputs();
    const remote = await res.json() as { body: BodyInputs | null; finance: FinanceInputs | null; age: number | null };
    if (remote.finance == null && remote.body == null) return loadRawInputs();

    const local = loadRawInputs();
    const merged = { body: remote.body ?? local?.body ?? null, finance: remote.finance ?? local?.finance };
    if (merged.finance == null) return loadRawInputs();

    try { window.localStorage.setItem(INPUTS_KEY, JSON.stringify(merged)); } catch { /* noop */ }
    if (remote.age != null) { try { window.localStorage.setItem(AGE_KEY, String(remote.age)); } catch { /* noop */ } }
    return merged as { body: BodyInputs | null; finance: FinanceInputs };
  } catch {
    return loadRawInputs();
  }
}
