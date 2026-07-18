/**
 * lib/netWorthHistory.ts — storage adapter for monthly net worth snapshots.
 * Same async-wrapper-around-localStorage pattern as scoreStorage/goalsStorage —
 * a future real backend only needs new function bodies here.
 */

import type { Goal } from './goalsStorage';

export interface NetWorthSnapshot {
  id: string;
  date: string;
  assets: number;
  liabilities: number;
  netWorth: number;
}

const KEY = 'wfl_networth_history';

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readSnapshots(): NetWorthSnapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeSnapshots(snaps: NetWorthSnapshot[]): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(snaps)); } catch { /* quota exceeded — non-critical */ }
}

export async function getSnapshots(): Promise<NetWorthSnapshot[]> {
  return readSnapshots().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function addSnapshot(assets: number, liabilities: number): Promise<NetWorthSnapshot> {
  const snap: NetWorthSnapshot = { id: genId(), date: new Date().toISOString(), assets, liabilities, netWorth: assets - liabilities };
  writeSnapshots([...readSnapshots(), snap]);
  return snap;
}

export async function deleteSnapshot(id: string): Promise<void> {
  writeSnapshots(readSnapshots().filter(s => s.id !== id));
}

export async function clearSnapshots(): Promise<void> {
  writeSnapshots([]);
}

/**
 * A 'net-worth' goal is set once and otherwise sits stale unless the user
 * remembers to open Goals and update it by hand — but the Net Worth
 * Calculator already produces a real, dated number every time it's run.
 * This overrides the goal's *displayed* current/lastUpdated from the latest
 * snapshot (never writes back to goal storage) so progress and the pace-based
 * ETA both reflect the real, most recent figure automatically. Goals of any
 * other type, or a 'net-worth' goal with no snapshots yet, pass through unchanged.
 */
export function syncNetWorthGoal(goal: Goal, snapshots: NetWorthSnapshot[]): Goal {
  if (goal.type !== 'net-worth' || snapshots.length === 0) return goal;
  const latest = snapshots[snapshots.length - 1]; // getSnapshots() sorts oldest → newest
  return { ...goal, current: latest.netWorth, lastUpdated: latest.date };
}
