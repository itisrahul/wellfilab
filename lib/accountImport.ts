/**
 * lib/accountImport.ts — one-time local→account import.
 *
 * A returning visitor may have real score/goal/net-worth/roadmap history
 * sitting in this browser's localStorage from before the account backend
 * existed. Signing in doesn't move that data anywhere on its own — the
 * account store starts empty next to it. This offers a one-time prompt
 * (components/dashboard/ImportLocalDataBanner.tsx) and, on confirmation,
 * pushes every local record into the account store, preserving each
 * record's real original id/date/history rather than re-stamping it as
 * happening "now" (see the id/date passthrough in the scores, goals, and
 * net-worth POST routes).
 *
 * Never overwrites: each category is skipped if the account already has
 * anything in it (e.g. already imported from another tab, or a genuine
 * second device with its own real history) — this is a one-time nudge, not
 * a sync/merge engine, so it only ever fills an empty account.
 */

import { getLocalScoreHistory } from './scoreStorage';
import { getLocalGoals } from './goalsStorage';
import { getLocalSnapshots } from './netWorthHistory';
import { loadRoadmapChecks, syncRoadmapChecksFromAccount } from './roadmapChecks';

const OFFERED_KEY = 'wfl_account_import_offered_v1';

function wasOffered(): boolean {
  if (typeof window === 'undefined') return true;
  try { return window.localStorage.getItem(OFFERED_KEY) === '1'; } catch { return true; }
}

function markOffered(): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(OFFERED_KEY, '1'); } catch { /* noop */ }
}

/** Cheap and synchronous — safe to call on every signed-in dashboard render
 * to decide whether to show the import banner. */
export function hasUnimportedLocalData(): boolean {
  if (wasOffered()) return false;
  return (
    getLocalScoreHistory().length > 0 ||
    getLocalGoals().length > 0 ||
    getLocalSnapshots().length > 0 ||
    Object.keys(loadRoadmapChecks()).length > 0
  );
}

/** Dismisses the banner without importing — the local data stays exactly
 * where it is, just not offered again on this device. */
export function dismissImportOffer(): void {
  markOffered();
}

export interface ImportSummary {
  scores: number;
  goals: number;
  netWorthSnapshots: number;
  roadmapChecks: number;
}

export async function importLocalDataToAccount(): Promise<ImportSummary> {
  const summary: ImportSummary = { scores: 0, goals: 0, netWorthSnapshots: 0, roadmapChecks: 0 };

  try {
    const local = getLocalScoreHistory();
    if (local.length > 0) {
      const res = await fetch('/api/scores');
      const remoteIsEmpty = res.ok && (await res.json()).history.length === 0;
      if (remoteIsEmpty) {
        // Oldest first, so the account ends up with the same newest-first order.
        for (const score of [...local].reverse()) {
          const r = await fetch('/api/scores', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(score),
          });
          if (r.ok) summary.scores++;
        }
      }
    }
  } catch { /* best-effort — a partial import still leaves local data intact */ }

  try {
    const local = getLocalGoals();
    if (local.length > 0) {
      const res = await fetch('/api/goals');
      const remoteIsEmpty = res.ok && (await res.json()).goals.length === 0;
      if (remoteIsEmpty) {
        for (const goal of local) {
          const r = await fetch('/api/goals', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: goal.id, type: goal.type, label: goal.label, target: goal.target, current: goal.current,
              startValue: goal.startValue, startDate: goal.startDate, targetDate: goal.targetDate,
              lastUpdated: goal.lastUpdated, paused: goal.paused, history: goal.history,
            }),
          });
          if (r.ok) summary.goals++;
        }
      }
    }
  } catch { /* best-effort */ }

  try {
    const local = getLocalSnapshots();
    if (local.length > 0) {
      const res = await fetch('/api/net-worth');
      const remoteIsEmpty = res.ok && (await res.json()).snapshots.length === 0;
      if (remoteIsEmpty) {
        for (const snap of local) {
          const r = await fetch('/api/net-worth', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: snap.id, date: snap.date, assets: snap.assets, liabilities: snap.liabilities }),
          });
          if (r.ok) summary.netWorthSnapshots++;
        }
      }
    }
  } catch { /* best-effort */ }

  try {
    const local = loadRoadmapChecks();
    if (Object.keys(local).length > 0) {
      // Merge with whatever the account already has (remote wins per-key —
      // matches syncRoadmapChecksFromAccount's rule), then push the result
      // back so the account store actually gains the local-only entries.
      const merged = await syncRoadmapChecksFromAccount();
      await fetch('/api/roadmap-checks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(merged),
      });
      summary.roadmapChecks = Object.keys(merged).length;
    }
  } catch { /* best-effort */ }

  markOffered();
  return summary;
}
