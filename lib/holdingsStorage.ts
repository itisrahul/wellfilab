/**
 * lib/holdingsStorage.ts — storage adapter for individual asset/liability
 * holdings (the real line items behind net worth: "EPF ₹17.3L", "Home Loan
 * ₹37L outstanding", etc.) — Backed by /api/holdings (Postgres, keyed by
 * Clerk userId) when signed in, with localStorage as an always-on
 * fallback/cache, same pattern as every other lib/*Storage.ts file.
 *
 * This is deliberately a layer BELOW net worth, not a replacement for it:
 * lib/netWorthHistory.ts's snapshots (assets, liabilities, netWorth on a
 * date) stay exactly as they are and keep powering the net-worth goal type
 * and the dashboard's Money section. Holdings exist so a snapshot's two
 * numbers can be computed from real, named line items instead of typed in
 * as two lump sums — computeTotals() below produces exactly the
 * {assets, liabilities} pair netWorthHistory.addSnapshot() already expects.
 */

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

export async function addHolding(input: Omit<Holding, 'id' | 'lastUpdated'>): Promise<Holding> {
  try {
    const res = await fetch('/api/holdings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`create failed: ${res.status}`);
    const { holding } = await res.json();
    writeHoldings([...readHoldings(), holding]);
    return holding as Holding;
  } catch {
    const holding: Holding = { ...input, id: genId(), lastUpdated: new Date().toISOString() };
    writeHoldings([...readHoldings(), holding]);
    return holding;
  }
}

export async function updateHolding(id: string, patch: Partial<Omit<Holding, 'id'>>): Promise<void> {
  try {
    await fetch(`/api/holdings/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
    });
  } catch { /* best-effort — local write below still applies */ }
  const now = new Date().toISOString();
  writeHoldings(readHoldings().map(h => h.id === id ? { ...h, ...patch, lastUpdated: now } : h));
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
