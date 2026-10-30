/**
 * lib/holdingsStorage.ts — storage adapter for individual asset/liability
 * holdings (the real line items behind net worth: "EPF ₹17.3L", "Home Loan
 * ₹37L outstanding", etc.) — Backed by /api/holdings (Postgres, keyed by
 * Clerk userId) when signed in, with localStorage as an always-on
 * fallback/cache, same pattern as every other lib/*Storage.ts file.
 *
 * The net-worth goal and the Assets tracker both read their monthly history
 * straight from these holdings (computeMonthlyNetWorthHistory below) — no
 * separate "record this month" action; a month's net worth is just the
 * last real value each holding had that month. lib/netWorthHistory.ts's
 * explicit snapshots are a separate, older mechanism kept only for the
 * standalone public Net Worth calculator tool, which has no holdings of
 * its own to derive a history from.
 */

import type { Goal } from './goalsStorage';

export type HoldingCategory = 'asset' | 'liability';

/** Shared asset-class vocabulary across both sides of the balance sheet —
 * e.g. "Car" and "RealEstate" both appear as an asset (the thing you own)
 * and, separately, as a liability (the loan against it). */
export const HOLDING_TYPES = ['Equity', 'Debt', 'Gold', 'Liquid', 'RealEstate', 'Car', 'Personal', 'Custom'] as const;
export type HoldingType = (typeof HOLDING_TYPES)[number];

export const HOLDING_TYPE_META: Record<HoldingType, { label: string; icon: string }> = {
  Equity:     { label: 'Equity',      icon: '📈' },
  Debt:       { label: 'Debt instruments', icon: '🏦' },
  Gold:       { label: 'Gold',        icon: '🪙' },
  Liquid:     { label: 'Liquid / cash', icon: '💵' },
  RealEstate: { label: 'Real estate', icon: '🏠' },
  Car:        { label: 'Vehicle',     icon: '🚗' },
  Personal:   { label: 'Personal',    icon: '👤' },
  Custom:     { label: 'Other',       icon: '📦' },
};

export interface HoldingHistoryPoint { date: string; value: number }

export interface Holding {
  id: string;
  category: HoldingCategory;
  type: HoldingType;
  /** Free text — the specific instrument: "EPF", "Reliance shares", "HDFC home loan". */
  subType: string;
  /** Always a positive magnitude regardless of category — `category` decides the sign in rollups. */
  currentValue: number;
  /** Lifetime principal actually put in (assets) or originally borrowed (liabilities) — optional, powers per-holding gain%. */
  investedAmount?: number;
  /** Monthly SIP/contribution (asset) or EMI (liability) — optional. */
  monthlyContribution?: number;
  lastUpdated: string;
  /** Every real value update, in order — powers "what changed this month".
   * Optional because holdings created before this field existed don't have
   * it; getHoldingHistory() below synthesizes a single current point for
   * those instead of inventing a past it never recorded. */
  history?: HoldingHistoryPoint[];
}

const KEY = 'wfl_holdings';

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readHoldings(): Holding[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeHoldings(h: Holding[]): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(h)); } catch { /* quota exceeded — non-critical */ }
}

export async function getHoldings(): Promise<Holding[]> {
  try {
    const res = await fetch('/api/holdings');
    if (res.ok) {
      const { holdings } = await res.json();
      return holdings as Holding[];
    }
  } catch { /* offline, signed out (401), or a server error — fall back to local */ }
  return readHoldings();
}

export async function addHolding(input: Omit<Holding, 'id' | 'lastUpdated' | 'history'>): Promise<Holding> {
  const now = new Date().toISOString();
  const withHistory = { ...input, history: [{ date: now, value: input.currentValue }] };
  try {
    const res = await fetch('/api/holdings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(withHistory),
    });
    if (!res.ok) throw new Error(`create failed: ${res.status}`);
    const { holding } = await res.json();
    writeHoldings([...readHoldings(), holding]);
    return holding as Holding;
  } catch {
    const holding: Holding = { ...withHistory, id: genId(), lastUpdated: now };
    writeHoldings([...readHoldings(), holding]);
    return holding;
  }
}

export async function updateHolding(id: string, patch: Partial<Omit<Holding, 'id'>>): Promise<void> {
  const now = new Date().toISOString();
  const existing = readHoldings().find(h => h.id === id);
  // Only append a new history point when the value itself actually moved —
  // editing just the monthly contribution or invested amount shouldn't log
  // a (0-delta) value change.
  const historyPatch = (patch.currentValue != null && existing && patch.currentValue !== existing.currentValue)
    ? { history: [...getHoldingHistory(existing), { date: now, value: patch.currentValue }] }
    : {};
  const fullPatch = { ...patch, ...historyPatch };

  try {
    await fetch(`/api/holdings/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fullPatch),
    });
  } catch { /* best-effort — local write below still applies */ }
  writeHoldings(readHoldings().map(h => h.id === id ? { ...h, ...fullPatch, lastUpdated: now } : h));
}

/** Real history for a holding — the actual log if one exists, or a
 * single current-value point for a holding saved before history was
 * tracked. Never fabricates a past value it doesn't actually have. */
export function getHoldingHistory(h: Holding): HoldingHistoryPoint[] {
  if (h.history && h.history.length > 0) return h.history;
  return [{ date: h.lastUpdated, value: h.currentValue }];
}

export async function deleteHolding(id: string): Promise<void> {
  try { await fetch(`/api/holdings/${id}`, { method: 'DELETE' }); } catch { /* best-effort */ }
  writeHoldings(readHoldings().filter(h => h.id !== id));
}

// ── Pure computation — no I/O, same real numbers the UI and the net-worth
// snapshot both read from ───────────────────────────────────────────────

export interface HoldingTotals {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  /** Sum of monthlyContribution across asset-side holdings — "how much am I adding". */
  monthlyInvestment: number;
  /** Sum of monthlyContribution across liability-side holdings — EMIs going out. */
  monthlyEMI: number;
}

export function computeTotals(holdings: Holding[]): HoldingTotals {
  const assets = holdings.filter(h => h.category === 'asset');
  const liabilities = holdings.filter(h => h.category === 'liability');
  const totalAssets = assets.reduce((s, h) => s + h.currentValue, 0);
  const totalLiabilities = liabilities.reduce((s, h) => s + h.currentValue, 0);
  return {
    totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities,
    monthlyInvestment: assets.reduce((s, h) => s + (h.monthlyContribution ?? 0), 0),
    monthlyEMI: liabilities.reduce((s, h) => s + (h.monthlyContribution ?? 0), 0),
  };
}

export interface HoldingChange {
  id: string; subType: string; category: HoldingCategory; type: HoldingType;
  fromValue: number; toValue: number; delta: number;
}

/** Compares each holding's current value against its value ~30 days ago —
 * the closest real recorded point at or before that cutoff, never
 * interpolated — "what changed this month, and where". A holding with no
 * history older than 30 days is skipped (nothing real to compare against
 * yet), not shown against a fabricated baseline. */
export function computeMonthOverMonthChanges(holdings: Holding[]): HoldingChange[] {
  const cutoff = Date.now() - 30 * 86400000;
  const changes: HoldingChange[] = [];
  for (const h of holdings) {
    const history = getHoldingHistory(h);
    const before = [...history].reverse().find(p => new Date(p.date).getTime() <= cutoff);
    if (!before) continue;
    const delta = h.currentValue - before.value;
    if (delta === 0) continue;
    changes.push({ id: h.id, subType: h.subType, category: h.category, type: h.type, fromValue: before.value, toValue: h.currentValue, delta });
  }
  return changes.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

export interface MonthlyNetWorthPoint { date: string; assets: number; liabilities: number; netWorth: number }

/**
 * Net worth, one point per calendar month, derived entirely from each
 * holding's own real update history — no separate "record this month"
 * action needed. For each month, every holding contributes its latest
 * recorded value at or before that month (carry-forward, never
 * interpolated); a holding added later simply doesn't count for months
 * before it existed. The most recent month is always included so "today"
 * shows up even mid-month, using whatever was last actually recorded.
 */
export function computeMonthlyNetWorthHistory(holdings: Holding[]): MonthlyNetWorthPoint[] {
  if (holdings.length === 0) return [];
  const perHoldingHistory = holdings.map(h => ({ h, history: getHoldingHistory(h) }));

  const months = new Set<string>();
  for (const { history } of perHoldingHistory) for (const p of history) months.add(p.date.slice(0, 7));
  months.add(new Date().toISOString().slice(0, 7));

  return [...months].sort().map(month => {
    const cutoff = new Date(`${month}-01T00:00:00.000Z`);
    cutoff.setUTCMonth(cutoff.getUTCMonth() + 1); // exclusive end of this month
    let assets = 0, liabilities = 0;
    for (const { h, history } of perHoldingHistory) {
      const upto = history.filter(p => new Date(p.date).getTime() < cutoff.getTime());
      if (upto.length === 0) continue; // holding didn't exist yet this month
      const latest = upto[upto.length - 1].value;
      if (h.category === 'asset') assets += latest; else liabilities += latest;
    }
    return { date: `${month}-01`, assets, liabilities, netWorth: assets - liabilities };
  });
}

/**
 * Overrides a net-worth goal's *displayed* current/lastUpdated/history from
 * the real holdings-derived monthly series (never writes back to goal
 * storage) — same role lib/netWorthHistory.ts's syncNetWorthGoal played
 * against manual snapshots, now against the auto-derived monthly history
 * instead. Goals of any other type, or a 'net-worth' goal with no holdings
 * yet, pass through unchanged.
 */
export function syncNetWorthGoalFromHoldings(goal: Goal, holdings: Holding[]): Goal {
  if (goal.type !== 'net-worth') return goal;
  const monthly = computeMonthlyNetWorthHistory(holdings);
  if (monthly.length === 0) return goal;
  const latest = monthly[monthly.length - 1];
  return {
    ...goal,
    current: latest.netWorth,
    lastUpdated: latest.date,
    history: monthly.map(m => ({ date: m.date, value: m.netWorth })),
  };
}

export interface MonthlyGainPoint extends MonthlyNetWorthPoint {
  /** vs. the previous month in this same derived series — null for the
   * first one, real arithmetic on two real totals, never estimated. */
  amountGain: number | null;
  pctGain: number | null;
}

/** Month-over-month gain for the holdings-derived monthly series — same
 * math as lib/netWorthHistory.ts's computeGainHistory, just over the
 * auto-derived points instead of manually recorded snapshots. */
export function computeMonthlyGainHistory(monthly: MonthlyNetWorthPoint[]): MonthlyGainPoint[] {
  return monthly.map((m, i) => {
    if (i === 0) return { ...m, amountGain: null, pctGain: null };
    const prev = monthly[i - 1];
    const amountGain = m.netWorth - prev.netWorth;
    const pctGain = prev.netWorth !== 0 ? (amountGain / Math.abs(prev.netWorth)) * 100 : null;
    return { ...m, amountGain, pctGain };
  });
}

export interface BreakdownSubRow { subType: string; value: number; id: string }
export interface BreakdownTypeRow { type: HoldingType; total: number; rows: BreakdownSubRow[] }
export interface BreakdownCategory { category: HoldingCategory; total: number; types: BreakdownTypeRow[] }

/** The Category → Type → Sub-type pivot — same shape as a typical personal
 * net-worth tracking sheet's summary table. */
export function computeBreakdown(holdings: Holding[]): BreakdownCategory[] {
  return (['asset', 'liability'] as HoldingCategory[]).map(category => {
    const inCategory = holdings.filter(h => h.category === category);
    const typeMap = new Map<HoldingType, Holding[]>();
    for (const h of inCategory) typeMap.set(h.type, [...(typeMap.get(h.type) ?? []), h]);
    const types: BreakdownTypeRow[] = [...typeMap.entries()].map(([type, hs]) => ({
      type, total: hs.reduce((s, h) => s + h.currentValue, 0),
      rows: hs.map(h => ({ id: h.id, subType: h.subType, value: h.currentValue })),
    })).sort((a, b) => b.total - a.total);
    return { category, total: inCategory.reduce((s, h) => s + h.currentValue, 0), types };
  });
}
