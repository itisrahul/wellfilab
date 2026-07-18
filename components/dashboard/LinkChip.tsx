'use client';
import type { ReactNode } from 'react';

/**
 * components/dashboard/LinkChip.tsx — same-page cross-widget navigation.
 *
 * Every dashboard widget names *why* it's showing something, and this is
 * the mechanism that makes the "why" a click away: scrolls to the related
 * widget and briefly highlights it (.wfl-pulse, defined in globals.css),
 * so the connection between e.g. a risk alert and the goal that fixes it
 * is something you can see, not just read.
 */
export function LinkChip({ targetId, children, variant = 'default' }: { targetId: string; children: ReactNode; variant?: 'default' | 'dark' }) {
  const handleClick = () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    el.classList.add('wfl-pulse');
    window.setTimeout(() => el.classList.remove('wfl-pulse'), 1600);
  };

  const style = variant === 'dark'
    ? 'text-white/60 bg-white/5 border border-white/10 hover:text-white hover:border-white/25'
    : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-300 dark:hover:border-teal-700';

  return (
    <button type="button" onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 transition-colors ${style}`}>
      🔗 {children}
    </button>
  );
}

export function LinkBar({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'dark' }) {
  const border = variant === 'dark' ? 'border-white/10' : 'border-gray-200 dark:border-gray-800';
  return (
    <div className={`flex flex-wrap gap-2 mt-4 pt-4 border-t border-dashed ${border}`}>
      {children}
    </div>
  );
}
