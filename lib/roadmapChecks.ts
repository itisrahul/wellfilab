/**
 * lib/roadmapChecks.ts — storage adapter for roadmap action checkmarks.
 *
 * Values are ISO timestamps (when an action was checked), not just booleans —
 * a non-empty string is still truthy, so every existing `checks[id]` /
 * `!!checks[id]` truthy-check across the app keeps working unchanged on both
 * old data (literal `true`, from before this file existed) and new data (a
 * real date). The timestamp is what makes a genuine Roadmap History possible.
 */

export type RoadmapChecks = Record<string, string | boolean>;

const CHECKS_KEY = 'wfl_roadmap_checks';

export function loadRoadmapChecks(): RoadmapChecks {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CHECKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function writeRoadmapChecks(checks: RoadmapChecks): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(CHECKS_KEY, JSON.stringify(checks)); } catch { /* noop */ }
}

/** Toggles one action's checked state, returning the updated map. Checking
 * records the real timestamp; unchecking removes the key entirely (not just
 * `false`), so a re-check later gets an honest new timestamp, not a stale one. */
export function toggleRoadmapCheck(checks: RoadmapChecks, id: string): RoadmapChecks {
  const next = { ...checks };
  if (next[id]) delete next[id];
  else next[id] = new Date().toISOString();
  writeRoadmapChecks(next);
  return next;
}

/** Real timestamp for a checked action, or null if unchecked or checked
 * before timestamps existed (legacy `true` value — honestly "unknown when",
 * not a fabricated date). */
export function checkedAt(checks: RoadmapChecks, id: string): string | null {
  const v = checks[id];
  return typeof v === 'string' ? v : null;
}
