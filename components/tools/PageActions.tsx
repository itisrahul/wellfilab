'use client';
import { useState } from 'react';
import { extractResultCards } from '@/lib/extractResults';
import { RecheckReminder } from '@/components/ui/RecheckReminder';

export function PageActions({ calcName, summary, calcUrl }: { calcName: string; summary?: string; calcUrl?: string }) {
  const [copied,     setCopied]     = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const url  = calcUrl ?? (typeof window !== 'undefined' ? window.location.href : '');
  const text = summary
    ? `📊 ${calcName}: ${summary}\nCalculate yours free → ${url}`
    : `Try the free ${calcName} → ${url}`;

  const waUrl    = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  const copy = () => {
    navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  /**
   * Download — generic, works for ALL calculators with zero per-widget code.
   * Uses the shared extractResultCards() helper (lib/extractResults.ts) so
   * the same DOM-reading logic powers download, the reminder summary, and
   * trend tracking consistently.
   */
  const download = () => {
    const container = document.getElementById('calc-widget');
    const results = extractResultCards(container);

    const now = new Date();
    const report = [
      `${calcName}`,
      `Generated: ${now.toLocaleString()}`,
      `Source: ${url}`,
      '─'.repeat(40),
      ...(results.length
        ? results.map(r => `${r.label}: ${r.value}${r.sub ? `  (${r.sub})` : ''}`)
        : ['No results captured — please calculate first.']),
      '─'.repeat(40),
      'Powered by HealthWealthTools — free calculators, no signup',
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${calcName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-result.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-3 print:hidden">
      <span className="text-xs text-gray-400 font-medium">Share:</span>

      {/* WhatsApp */}
      <a href={waUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-all">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.117 1.528 5.847L.057 23.453c-.072.265.163.5.427.428l5.638-1.471A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.912 0-3.703-.507-5.248-1.393l-.377-.222-3.91 1.019 1.042-3.803-.241-.392A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
        WhatsApp
      </a>

      {/* Twitter/X */}
      <a href={tweetUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-xs font-semibold transition-all">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        Tweet
      </a>

      {/* Copy link */}
      <button onClick={copy}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-all">
        {copied ? '✅ Copied!' : '🔗 Copy link'}
      </button>

      {/* Download result */}
      <button onClick={download}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-all">
        {downloaded ? '✅ Downloaded!' : '⬇️ Download result'}
      </button>

      {/* Remind me to recalculate — zero-backend retention hook, see ROADMAP.md */}
      <RecheckReminder calcName={calcName} calcUrl={url} resultSummary={summary} />

      {/* Print */}
      <button onClick={() => window.print()}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-all">
        🖨️ Print / PDF
      </button>
    </div>
  );
}
