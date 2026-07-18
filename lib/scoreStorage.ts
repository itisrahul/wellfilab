/**
 * lib/scoreStorage.ts — storage adapter for the WellFiLab Score.
 *
 * Every read/write to score data goes through this file and nowhere else.
 * The algorithm (lib/wellfilab-score.ts) stays pure — it takes inputs +
 * history in, returns a WellFiScore out, and never touches storage itself.
 *
 * Backed by /api/scores (Postgres, keyed by Clerk userId) when signed in,
 * with localStorage as an always-on fallback: anonymous visitors (the
 * public /score page requires no account) keep working exactly as before,
 * and any network/auth failure degrades to the local copy rather than
 * losing a result. Every write also mirrors to localStorage so the fallback
 * never goes stale relative to what the account store has.
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

/** Score history, newest first, capped at MAX_HISTORY entries — from the
 * account store when signed in, local cache otherwise. */
export async function getScoreHistory(): Promise<WellFiScore[]> {
  try {
    const res = await fetch('/api/scores');
    if (res.ok) {
      const { history } = await res.json();
      return history as WellFiScore[];
    }
  } catch {
    /* offline, signed out (401), or a server error — fall back to local */
  }
  return readJSON<WellFiScore[]>(HISTORY_KEY, []);
}

/** Most recent score, or null if the user has never taken it. Falls back to
 * the local copy while signed in but not yet synced — see the one-time
 * import flow in lib/accountImport.ts. */
export async function getLatestScore(): Promise<WellFiScore | null> {
  const history = await getScoreHistory();
  if (history.length > 0) return history[0];
  return readJSON<WellFiScore | null>(LATEST_KEY, null);
}

/**
 * Persists a freshly-calculated score: stamps id + date (server-side when
 * signed in, so the id doubles as the real DB primary key), sets it as the
 * latest score, and unshifts it into history. Returns the stamped record so
 * the caller can render it without a second read.
 */
export async function saveScore(score: WellFiScore): Promise<WellFiScore> {
  let stamped: WellFiScore;
  try {
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(score),
    });
    if (!res.ok) throw new Error(`save failed: ${res.status}`);
    ({ score: stamped } = await res.json());
  } catch {
    // Signed out, offline, or a server error — save locally so nothing is lost.
    stamped = { ...score, id: genId(), date: new Date().toISOString() };
  }

  writeJSON(LATEST_KEY, stamped);
  const history = readJSON<WellFiScore[]>(HISTORY_KEY, []);
  writeJSON(HISTORY_KEY, [stamped, ...history].slice(0, MAX_HISTORY));

  return stamped;
}

/** Local-only read, bypassing the remote-first fallback above — used by the
 * one-time import flow (lib/accountImport.ts) to see what's actually sitting
 * in this browser regardless of what the account store currently has. */
export function getLocalScoreHistory(): WellFiScore[] {
  return readJSON<WellFiScore[]>(HISTORY_KEY, []);
}

/** Clears all stored score data — used by a "clear my history" control. */
export async function clearScoreHistory(): Promise<void> {
  try { await fetch('/api/scores', { method: 'DELETE' }); } catch { /* best-effort */ }
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LATEST_KEY);
    window.localStorage.removeItem(HISTORY_KEY);
  } catch { /* noop */ }
}
