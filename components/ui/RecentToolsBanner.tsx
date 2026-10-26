'use client';
import { useEffect, useState } from 'react';
import { getBySlug } from '@/config/tools';
import { getHistory } from './CalcHistory';

interface RecentTool { slug: string; icon: string; title: string; summary: string }

/**
 * Turns the real, already-recorded `hwt_calc_history` (every calculator
 * writes one entry per tool on use) into a small "you've already done
 * this" acknowledgement — shown on the Score's entry screen and the
 * Dashboard's no-score state, the two places a returning tool user was
 * previously greeted as a total stranger. Renders nothing for a genuinely
 * new visitor (empty history) or during SSR (localStorage-only).
 */
export function RecentToolsBanner({ className = '' }: { className?: string }) {
  const [items, setItems] = useState<RecentTool[]>([]);

  useEffect(() => {
    const mapped = getHistory()
      .map(h => {
        const calc = getBySlug(h.calcSlug);
        return calc ? { slug: h.calcSlug, icon: calc.icon, title: calc.short, summary: h.summary } : null;
      })
      .filter((x): x is RecentTool => x !== null)
      .slice(0, 4);
    setItems(mapped);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className={className}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Already on this site</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {items.map(t => (
          <span key={t.slug}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <span>{t.icon}</span>{t.title}: <span className="font-semibold text-gray-900 dark:text-white">{t.summary}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
