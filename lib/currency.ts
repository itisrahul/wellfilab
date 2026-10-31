/**
 * lib/currency.ts — plain, server-safe currency formatting.
 *
 * The real preference lives in lib/useCurrency.tsx's CurrencyProvider
 * (React Context, already wired into app/layout.tsx) — this file only
 * mirrors its current code into a plain module variable, because
 * lib/roadmapActions.ts's fmtINR, lib/goalDisplay.ts's fmtVal, and a
 * handful of local money formatters are plain functions called from
 * dozens of places, some of them (app/page.tsx) Server Components that
 * can't call a hook. CurrencyProvider calls setCurrentCurrencyCode
 * whenever the preference changes or is first detected, keeping this
 * mirror in sync; nothing else should call that setter.
 *
 * Every real number this app stores — goal targets, holdings, roadmap
 * projections, score inputs — is entered and kept in INR, the product's
 * home currency. Switching the display currency converts that same real
 * number using the approximate exchange rates the public Currency
 * Converter tool already relies on (a real, if static, rate — never an
 * invented one) rather than just relabeling the symbol.
 */
import { CURRENCIES, FX } from './calc';

// INR, not a generic default — every server-rendered page (the homepage's
// illustrative SIP/EMI/FIRE numbers, and the brief pre-hydration paint of
// every client page before CurrencyProvider's locale detection runs)
// renders with this value, and this product's content — lakh/crore
// notation, ₹-denominated pricing and examples throughout — is India-first.
let currentCode: string = 'INR'; // matches lib/useCurrency.tsx's own default before detection runs

/** Called only by lib/useCurrency.tsx's CurrencyProvider. */
export function setCurrentCurrencyCode(code: string): void {
  currentCode = code;
}

export function getCurrentCurrencyCode(): string {
  return currentCode;
}

/** Converts a real INR amount into the currently selected display
 * currency. Identity when INR is selected. */
export function convertFromINR(amountINR: number): number {
  if (currentCode === 'INR') return amountINR;
  const rate = (FX[currentCode] ?? FX.INR) / FX.INR;
  return amountINR * rate;
}

/**
 * Formats a number that's already in the selected display currency (no
 * conversion) — for a caller that converted once up front (e.g. a chart
 * plotting several already-converted points) and just needs the same
 * Lakh/Crore-for-INR-only notation applied for display.
 */
export function formatCurrencyAmount(amount: number, decimals = 1): string {
  const c = CURRENCIES.find(x => x.code === currentCode) ?? CURRENCIES[0];
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '−' : '';
  if (c.code === 'INR') {
    if (abs >= 1e7) return `${sign}${c.sym}${(abs / 1e7).toFixed(decimals)}Cr`;
    if (abs >= 1e5) return `${sign}${c.sym}${(abs / 1e5).toFixed(decimals)}L`;
    if (abs >= 1000) return `${sign}${c.sym}${(abs / 1000).toFixed(0)}K`;
    return `${sign}${c.sym}${Math.round(abs).toLocaleString('en-IN')}`;
  }
  if (abs >= 1e9) return `${sign}${c.sym}${(abs / 1e9).toFixed(decimals)}B`;
  if (abs >= 1e6) return `${sign}${c.sym}${(abs / 1e6).toFixed(decimals)}M`;
  if (abs >= 1000) return `${sign}${c.sym}${(abs / 1000).toFixed(0)}K`;
  return `${sign}${c.sym}${Math.round(abs).toLocaleString()}`;
}

/**
 * The one money formatter every ₹-denominated display in the app should
 * go through — dashboard, goals, roadmap, history. Converts the real INR
 * amount into the selected display currency, then formats it (Lakh/Crore
 * only for INR; K/M/B/T for everything else).
 */
export function fmtMoney(amountINR: number, decimals = 1): string {
  return formatCurrencyAmount(convertFromINR(amountINR), decimals);
}
