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
 */

import type { BodyInputs, FinanceInputs } from './wellfilab-score';

const INPUTS_KEY = 'wfl_score_inputs_v1';
const AGE_KEY = 'wfl_known_age';

export function saveRawInputs(body: BodyInputs | null, finance: FinanceInputs): void {
  try {
    window.localStorage.setItem(INPUTS_KEY, JSON.stringify({ body, finance }));
    if (body?.age != null) saveAge(body.age);
  } catch { /* noop */ }
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
}

export function loadAge(): number | null {
  try {
    const raw = window.localStorage.getItem(AGE_KEY);
    return raw ? Number(raw) : null;
  } catch { return null; }
}
