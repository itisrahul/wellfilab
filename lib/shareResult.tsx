'use client';
import { useState, useEffect } from 'react';

/**
 * Encodes calculator inputs into a compact URL-safe string.
 * Uses base64url encoding — no backend needed.
 * 
 * Usage:
 *   <ShareButton inputs={{ principal: 10000, rate: 8, years: 10 }} calcName="Compound Interest" />
 * 
 * The URL becomes: /tools/finance/compound?s=eyJwcmluY2lwYWwiOjEwMDAwLCJyYXRlIjo4LCJ5ZWFycyI6MTB9
 * When someone opens that URL, the calculator pre-fills with those values.
 */

export function encodeInputs(inputs: Record<string, string | number>): string {
  try {
    const json  = JSON.stringify(inputs);
    const b64   = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return b64;
  } catch {
    return '';
  }
}

export function decodeInputs(s: string): Record<string, string | number> | null {
  try {
    const b64   = s.replace(/-/g, '+').replace(/_/g, '/');
    const json  = atob(b64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Hook — reads shared inputs from URL on mount */
export function useSharedInputs(): Record<string, string | number> | null {
  const [shared, setShared] = useState<Record<string, string | number> | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('s');
    if (s) setShared(decodeInputs(s));
  }, []);
  return shared;
}

/** Share button — copies link to clipboard and shows confirmation */
export function ShareButton({
  inputs,
  calcName,
  className,
}: {
  inputs: Record<string, string | number>;
  calcName: string;
  className?: string;
}) {
  const [state, setState] = useState<'idle' | 'copied'>('idle');

  const share = async () => {
    const encoded = encodeInputs(inputs);
    const url = `${window.location.origin}${window.location.pathname}?s=${encoded}`;

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title: `My ${calcName} result`, url });
        return;
      } catch {}
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setState('copied');
      setTimeout(() => setState('idle'), 2500);
    } catch {}
  };

  return (
    <button
      onClick={share}
      className={className ?? `flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-teal-400 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400 transition-all`}>
      {state === 'copied' ? (
        <>
          <svg className="w-3.5 h-3.5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          Link copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          Share result
        </>
      )}
    </button>
  );
}

/** Compact link icon version — for tight spaces */
export function ShareIconButton({ inputs, calcName }: { inputs: Record<string, string | number>; calcName: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const encoded = encodeInputs(inputs);
    const url = `${window.location.origin}${window.location.pathname}?s=${encoded}`;
    if (navigator.share) { try { await navigator.share({ title: `My ${calcName} result`, url }); return; } catch {} }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  return (
    <button onClick={share} title="Share this result"
      className="p-1.5 rounded-lg text-gray-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all">
      {copied
        ? <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
      }
    </button>
  );
}
