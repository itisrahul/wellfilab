/**
 * app/score/compareLink.ts — "compare with a friend" via a self-contained
 * URL, with no backend.
 *
 * HOW IT WORKS
 * --------------
 * The score being compared is small and fully known in shape (6 fixed
 * dimensions, each 0-100, plus an optional first name) — small enough to
 * encode directly into a query param rather than needing a database row
 * and a generated ID. The receiving browser decodes the param locally;
 * nothing is ever sent to or stored on a server. This keeps the "zero
 * backend" constraint from ROADMAP.md while still enabling a genuine
 * two-person comparison, which a flat percentile estimate cannot give you.
 *
 * HONESTY NOTE
 * --------------
 * This only works if the link is actually shared and opened — there is no
 * notification, no persistence beyond the link itself, and the name field
 * is free text the sender chooses (not verified identity). The UI copy
 * should describe it as "a link that carries your friend's score with it,"
 * never as an account or saved comparison.
 */

import { DIMS } from './data';
import type { ScoreResult } from './types';

export interface CompareSnapshot {
  name: string;
  overall: number;
  health: number;
  wealth: number;
  balance: number;
  dims: Record<string, number>;
}

/** Encodes a result into a URL-safe compact string for the `?vs=` param. */
export function encodeCompareLink(result: ScoreResult, name: string): string {
  const dims: Record<string, number> = {};
  result.dims.forEach(d => { dims[d.dim.id] = d.pct; });
  const snapshot: CompareSnapshot = {
    name: name.trim().slice(0, 24) || 'A friend',
    overall: result.overall,
    health: result.health,
    wealth: result.wealth,
    balance: result.balance,
    dims,
  };
  const json = JSON.stringify(snapshot);
  // base64url — safe in a query string, no padding/slashes to escape
  const b64 = typeof window !== 'undefined'
    ? window.btoa(unescape(encodeURIComponent(json)))
    : Buffer.from(json, 'utf-8').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Decodes the `?vs=` param back into a snapshot. Returns null on any malformed input — never throws into a render. */
export function decodeCompareLink(param: string): CompareSnapshot | null {
  try {
    const b64 = param.replace(/-/g, '+').replace(/_/g, '/');
    const json = typeof window !== 'undefined'
      ? decodeURIComponent(escape(window.atob(b64)))
      : Buffer.from(b64, 'base64').toString('utf-8');
    const parsed = JSON.parse(json);
    if (typeof parsed?.overall !== 'number' || typeof parsed?.dims !== 'object') return null;
    // Guard against a tampered/garbled param producing nonsense values in the UI
    const clamp = (v: unknown) => Math.min(100, Math.max(0, typeof v === 'number' ? v : 0));
    const dims: Record<string, number> = {};
    DIMS.forEach(d => { dims[d.id] = clamp(parsed.dims[d.id]); });
    return {
      name: typeof parsed.name === 'string' ? parsed.name.slice(0, 24) : 'A friend',
      overall: clamp(parsed.overall),
      health: clamp(parsed.health),
      wealth: clamp(parsed.wealth),
      balance: clamp(parsed.balance),
      dims,
    };
  } catch {
    return null;
  }
}

export function buildCompareUrl(result: ScoreResult, name: string): string {
  const encoded = encodeCompareLink(result, name);
  return `https://wellfilab.com/score?vs=${encoded}`;
}
