/**
 * lib/scoreFocus.ts — "what do you want to track" preference.
 *
 * Supports the 3 real user flows: Health only, Wealth only, or both
 * together. This does NOT change what data the score/roadmap collect or
 * compute — the underlying score is always the same real calculation.
 * It changes what's *surfaced*: dashboard widgets, roadmap phases, and
 * goal suggestions all read this to show only what the user asked for,
 * instead of forcing a combined view on someone who only wants one side.
 */

export type ScoreFocus = 'health' | 'wealth' | 'both';

const KEY = 'wfl_score_focus';

export function getScoreFocus(): ScoreFocus {
  if (typeof window === 'undefined') return 'both';
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw === 'health' || raw === 'wealth' || raw === 'both' ? raw : 'both';
  } catch { return 'both'; }
}

export function setScoreFocus(focus: ScoreFocus): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, focus); } catch { /* noop */ }
}

/** Fine-grained dimension ids that belong to each focus — used to filter
 * roadmap phases, top priorities, and next-step recommendations. */
export const HEALTH_DIM_IDS = new Set(['sleep', 'movement', 'stress']);
export const WEALTH_DIM_IDS = new Set(['savings', 'investing', 'debt']);

export function dimMatchesFocus(dimId: string, focus: ScoreFocus): boolean {
  if (focus === 'both') return true;
  if (focus === 'health') return HEALTH_DIM_IDS.has(dimId);
  return WEALTH_DIM_IDS.has(dimId);
}
