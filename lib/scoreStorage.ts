/**
 * lib/scoreStorage.ts — storage adapter for the WellFiLab Score.
 *
 * Every read/write to localStorage for the score system goes through this
 * file and nowhere else. The algorithm (lib/wellfilab-score.ts) is already
 * pure — it takes inputs + history in, returns a WellFiScore out, and never
 * touches storage itself. UI code (the /score page, the dashboard) only
 * ever calls the functions below, never `localStorage` directly.
 *
 * Why this separation matters: when a real backend + database exists, only
 * this file changes — swap each function body for a `fetch('/api/scores')`
 * call. Every function here is already async (even though localStorage is
 * synchronous), so call sites already `await` them and won't need to
 * change at all. Records already carry a client-generated `id` and a
 * `date`, which is exactly the shape a `scores` DB table needs — no ID
 * renumbering or backfill required when that migration happens.
 *
 * Honesty note: today this is local-only. Clearing browser data or
 * switching devices loses history. Any UI copy about this should say "on
 * this device", not imply an account-wide sync that doesn't exist yet.
 */

import type { WellFiScore } from './wellfilab-score';

const LATEST_KEY  = 'wfl_score_v2';
const HISTORY_KEY = 'wfl_score_history_v2';
const MAX_HISTORY = 30;

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
    /* quota exceeded or unavailable — history is a nice-to-have, never block the core flow */
  }
}

/** Most recent score, or null if the user has never taken it. */
export async function getLatestScore(): Promise<WellFiScore | null> {
  return readJSON<WellFiScore | null>(LATEST_KEY, null);
}

/** Score history, newest first, capped at MAX_HISTORY entries. */
export async function getScoreHistory(): Promise<WellFiScore[]> {
  return readJSON<WellFiScore[]>(HISTORY_KEY, []);
}

/**
 * Persists a freshly-calculated score: stamps id + date, sets it as the
 * latest score, and unshifts it into history. Returns the stamped record
 * so the caller can render it without a second read.
 */
export async function saveScore(score: WellFiScore): Promise<WellFiScore> {
  const stamped: WellFiScore = { ...score, id: genId(), date: new Date().toISOString() };

  writeJSON(LATEST_KEY, stamped);

  const history = await getScoreHistory();
  const updated = [stamped, ...history].slice(0, MAX_HISTORY);
  writeJSON(HISTORY_KEY, updated);

  return stamped;
}

/** Clears all locally stored score data — used by a "clear my history" control. */
export async function clearScoreHistory(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LATEST_KEY);
    window.localStorage.removeItem(HISTORY_KEY);
  } catch { /* noop */ }
}
