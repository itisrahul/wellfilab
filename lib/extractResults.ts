/**
 * lib/extractResults.ts — reads the currently-displayed calculator result
 * directly from the DOM, using the standard `.result-card` / `.calc-num-*`
 * conventions every calculator widget already follows.
 *
 * This is shared by:
 *  - PageActions' "Download result" (.txt export)
 *  - RecheckReminder (puts the first result line into the .ics description)
 *  - Trend tracking (captures a numeric snapshot to chart over time)
 *
 * Centralizing this means all three features automatically work for every
 * calculator, including future ones, as long as results use the standard
 * result-card markup — no per-calculator wiring needed.
 */

export interface ExtractedResult {
  label: string;
  value: string;
  sub?: string;
}

export function extractResultCards(container: HTMLElement | null): ExtractedResult[] {
  if (!container) return [];
  const out: ExtractedResult[] = [];

  container.querySelectorAll<HTMLElement>('.result-card').forEach(card => {
    const label = card.querySelector('.result-label')?.textContent?.trim();
    const value = card.querySelector('.calc-num-lg, .calc-num-md, .calc-num-sm')?.textContent?.trim();
    const sub   = card.querySelector('.result-label ~ p.text-xs')?.textContent?.trim();
    if (label && value) out.push({ label, value, sub });
  });

  return out;
}

/** Builds a single human-readable summary line from the first result card — used in reminders/notifications. */
export function summarizeFirstResult(container: HTMLElement | null): string | undefined {
  const [first] = extractResultCards(container);
  if (!first) return undefined;
  return `${first.label}: ${first.value}`;
}

/**
 * Attempts to pull a single numeric value out of a result string for trend
 * tracking — e.g. "₹42,98,935.00" -> 4298935, "22.9" -> 22.9, "5,000/mo" -> 5000.
 * Strips currency symbols, commas, and trailing units; keeps the first
 * decimal number found. Returns null if no number could be parsed.
 */
export function parseNumericValue(value: string): number | null {
  const cleaned = value.replace(/[,\s]/g, '');
  const match = cleaned.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const num = parseFloat(match[0]);
  return isFinite(num) ? num : null;
}
