'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Calculator } from '@/config/tools';

/**
 * ExploreCalculators — a row of tabs for related calculators, each showing
 * a one-line "quick example" so visitors can preview what the tool does
 * before clicking through.
 *
 * The example text comes from (in priority order):
 *  1. The first entry in `content.examples` (rich SEO content, if present)
 *  2. The first entry in `tips` (every calculator has these)
 *  3. The calculator's `desc` as a final fallback
 *
 * This works for every calculator with zero per-calculator wiring.
 */
export function ExploreCalculators({ related }: { related: Calculator[] }) {
  const tabs = related.slice(0, 6);
  const [active, setActive] = useState(0);
  if (tabs.length === 0) return null;

  const current = tabs[active];
  const example = current.content?.examples?.[0];
  const quickText = example
    ? example.result
    : current.tips[0] ?? current.desc;
  const quickLabel = example ? example.title : 'Quick tip';

  return (
    <div className="mt-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-4 pt-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
          🔎 Explore related calculators
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: 'thin' }}>
        {tabs.map((c, i) => (
          <button
            key={c.slug}
            onClick={() => setActive(i)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all whitespace-nowrap ${
              i === active
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-orange-300'
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.short}</span>
          </button>
        ))}
      </div>

      {/* Quick view */}
      <div className="px-4 pb-4 pt-1">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{current.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{current.title}</p>
              <p className="text-xs text-gray-400 mt-0.5 mb-1.5">{quickLabel}</p>
              <p className="text-xs font-mono text-orange-600 dark:text-orange-400 leading-relaxed break-words">
                {quickText}
              </p>
            </div>
          </div>
          <Link
            href={`/${current.category}/${current.slug}`}
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
          >
            Open {current.short} →
          </Link>
        </div>
      </div>
    </div>
  );
}
export { ExploreCalculators as ExploreTools };
