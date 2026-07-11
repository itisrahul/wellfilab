/**
 * lib/trendTracking.ts — keeps a rolling history of numeric snapshots per
 * calculator, so repeat visits can show a trend instead of just "your last
 * result."
 *
 * WHY THIS IS SEPARATE FROM CalcHistory / saveHistory
 * -----------------------------------------------------
 * `components/ui/CalcHistory.tsx`'s `saveHistory()` intentionally keeps
 * only ONE entry per calculator slug (it overwrites on every calculation —
 * that's the right design for "what did I calculate last time"). Trend
 * tracking needs the OPPOSITE: many timestamped points over time, so this
 * is a deliberately distinct storage key and API, not a modification of
 * the existing history feature.
 *
 * DATA MODEL
 * ----------
 * Stored under `hwt_trend_<slug>` in localStorage, capped at 24 points
 * (roughly 2 years of monthly check-ins, or more frequent short-term use) —
 * this is a local-only feature for now (see ROADMAP.md Layer 0-2), but the
 * shape below (`TrendPoint[]`) is exactly what a server-synced version
 * would also use, so porting to an account-backed store later is a swap
 * of the storage adapter functions at the bottom of this file, not a
 * rewrite of the data model or the chart component that consumes it.
 */

export interface TrendPoint {
  /** ms since epoch */
  date: number;
  /** the parsed numeric value, e.g. 22.9 for a BMI result */
  value: number;
  /** the original display label, e.g. "BMI" or "Maturity value" */
  label: string;
  /** the original formatted string, e.g. "₹42,98,935.00" — for display */
  display: string;
}

const PREFIX   = 'hwt_trend_';
const MAX_PTS  = 24;
/** Don't record a new point within this many hours of the last one — avoids
 *  cluttering the trend with every keystroke while someone is tweaking inputs. */
const MIN_GAP_HOURS = 6;

function key(slug: string): string {
  return `${PREFIX}${slug}`;
}

export function getTrend(slug: string): TrendPoint[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key(slug));
    return raw ? (JSON.parse(raw) as TrendPoint[]) : [];
  } catch {
    return [];
  }
}

/**
 * Records a new trend point for a calculator, unless the most recent point
 * is too recent (see MIN_GAP_HOURS) — in which case it updates that point
 * in place rather than adding a duplicate. This means a user actively
 * tweaking sliders doesn't flood their trend with noise, but a genuine
 * return visit days/weeks/months later always creates a new point.
 */
export function recordTrendPoint(slug: string, point: Omit<TrendPoint, 'date'>): TrendPoint[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getTrend(slug);
    const now = Date.now();
    const last = existing[existing.length - 1];

    let updated: TrendPoint[];
    if (last && now - last.date < MIN_GAP_HOURS * 60 * 60 * 1000) {
      updated = [...existing.slice(0, -1), { ...point, date: now }];
    } else {
      updated = [...existing, { ...point, date: now }].slice(-MAX_PTS);
    }

    localStorage.setItem(key(slug), JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearTrend(slug: string): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(key(slug)); } catch {}
}

/** Simple % change from the first to the most recent point — for a quick "+12% since you started" type message. */
export function trendChangePct(points: TrendPoint[]): number | null {
  if (points.length < 2) return null;
  const first = points[0].value;
  const last  = points[points.length - 1].value;
  if (first === 0) return null;
  return ((last - first) / Math.abs(first)) * 100;
}
