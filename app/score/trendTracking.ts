/**
 * app/score/trendTracking.ts — local history of past Score results.
 *
 * Framework-agnostic (no React, no Next.js APIs) by design — see
 * ROADMAP.md. This keeps up to MAX_POINTS timestamped snapshots in
 * localStorage. Porting to a server-backed version later (once
 * accounts exist, per ROADMAP Layer 3+) means swapping the storage
 * adapter functions below (load/save), not rewriting call sites.
 *
 * Honesty note: this is local-only. Clearing browser data or switching
 * devices loses the history. The UI for this should always describe it
 * as "on this device" rather than implying any account/sync exists.
 */

import type { ScoreResult } from './types';

const KEY = 'wfl_score_history_v1';
const MAX_POINTS = 24;

export interface ScoreSnapshot {
  date: string;       // ISO timestamp
  overall: number;
  health: number;
  wealth: number;
  balance: number;
  /** per-dimension pct, keyed by dimension id, so a per-dimension trend is possible later without re-deriving from ScoreResult */
  dims: Record<string, number>;
}

function toSnapshot(result: ScoreResult): ScoreSnapshot {
  const dims: Record<string, number> = {};
  result.dims.forEach(d => { dims[d.dim.id] = d.pct; });
  return {
    date: new Date().toISOString(),
    overall: result.overall,
    health: result.health,
    wealth: result.wealth,
    balance: result.balance,
    dims,
  };
}

/** Safe localStorage read — returns [] on any failure (private browsing, quota, corrupted data, SSR). */
function load(): ScoreSnapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function save(snapshots: ScoreSnapshot[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(snapshots));
  } catch {
    /* quota exceeded or unavailable — fail silently, history is a nice-to-have, never block the core flow */
  }
}

/** Records a new result and returns the full updated history (oldest first), capped at MAX_POINTS. */
export function recordScore(result: ScoreResult): ScoreSnapshot[] {
  const existing = load();
  const updated = [...existing, toSnapshot(result)].slice(-MAX_POINTS);
  save(updated);
  return updated;
}

/** Returns the stored history without recording anything new. */
export function getHistory(): ScoreSnapshot[] {
  return load();
}

/** Clears all locally stored history — used by a "clear my history" control, since this is local data the user should be able to wipe. */
export function clearHistory() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch { /* noop */ }
}

export interface TrendSummary {
  hasHistory: boolean;
  previous: ScoreSnapshot | null;
  delta: { overall: number; health: number; wealth: number } | null;
  daysSincePrevious: number | null;
}

/** Compares the just-recorded result against the prior one (if any), for the "you're up 6 points since last time" framing. */
export function getTrendSummary(history: ScoreSnapshot[]): TrendSummary {
  if (history.length < 2) {
    return { hasHistory: false, previous: null, delta: null, daysSincePrevious: null };
  }
  const current = history[history.length - 1];
  const previous = history[history.length - 2];
  const daysSincePrevious = Math.round(
    (new Date(current.date).getTime() - new Date(previous.date).getTime()) / (1000 * 60 * 60 * 24)
  );
  return {
    hasHistory: true,
    previous,
    delta: {
      overall: current.overall - previous.overall,
      health: current.health - previous.health,
      wealth: current.wealth - previous.wealth,
    },
    daysSincePrevious,
  };
}
