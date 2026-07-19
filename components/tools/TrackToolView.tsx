'use client';
import { useEffect } from 'react';

/**
 * Fires one anonymous view-count increment per tool per browser tab
 * session (sessionStorage dedup — reloading or re-visiting the same tab
 * doesn't inflate the count, a fresh tab does). No personal data leaves
 * the browser beyond the tool slug itself; see the toolViews schema
 * comment in lib/db/schema.ts for what this powers.
 */
export function TrackToolView({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `wfl_viewed_${slug}`;
    if (typeof window === 'undefined' || sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    fetch('/api/tool-views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => { /* best-effort — never block or surface an error for a view counter */ });
  }, [slug]);

  return null;
}
