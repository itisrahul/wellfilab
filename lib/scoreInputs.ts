/**
 * lib/scoreInputs.ts — the raw BodyInputs/FinanceInputs behind a saved score.
 *
 * saveScore() (lib/scoreStorage.ts) only persists the computed WellFiScore, not
 * the inputs that produced it — but the score, roadmap, goals and dashboard pages
 * all need those real numbers (income, sleep hours, savings...) to compute
 * genuine, non-generic content. Originally a page-local companion key duplicated
 * across three files; consolidated here once a fourth consumer (the dashboard)
 * needed the same read, since a fourth copy-paste would be one too many.
 */

import type { BodyInputs, FinanceInputs } from './wellfilab-score';

const INPUTS_KEY = 'wfl_score_inputs_v1';

export function saveRawInputs(body: BodyInputs, finance: FinanceInputs): void {
  try { window.localStorage.setItem(INPUTS_KEY, JSON.stringify({ body, finance })); } catch { /* noop */ }
}

export function loadRawInputs(): { body: BodyInputs; finance: FinanceInputs } | null {
  try {
    const raw = window.localStorage.getItem(INPUTS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
