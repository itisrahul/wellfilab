'use client';

import { useState } from 'react';

interface Props {
  url: string;
  title: string;
}

/**
 * EmbedButton — shows a copyable <iframe> snippet other sites can paste in
 * to embed this calculator. Rendered once per tool page (page-level, not
 * per-widget) so it works identically across every calculator.
 */
export function EmbedButton({ url, title }: Props) {
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState(false);

  const snippet = `<iframe src="${url}" width="100%" height="640" style="border:0;border-radius:12px;overflow:hidden" title="${title} — WellFiLab" loading="lazy"></iframe>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-teal-400 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3m4-8L3 8m0 0l4 4" />
        </svg>
        Embed this calculator
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 max-w-lg w-full p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Embed this calculator</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
              Paste this snippet into your site to embed the {title} calculator, free.
            </p>
            <pre className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-xs text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap break-all border border-gray-100 dark:border-gray-700 font-mono">
              {snippet}
            </pre>
            <button
              onClick={copy}
              className="mt-3 w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-all"
            >
              {copied ? '✓ Copied!' : 'Copy code'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
