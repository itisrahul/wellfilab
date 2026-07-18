'use client';
import type { ScoreFocus } from '@/lib/scoreFocus';

const OPTIONS: { value: ScoreFocus; label: string; icon: string }[] = [
  { value: 'health', label: 'Health', icon: '💪' },
  { value: 'wealth', label: 'Wealth', icon: '💰' },
  { value: 'both',   label: 'Both',   icon: '⚖️' },
];

/**
 * FocusSelector — lets a user assess and track Health only, Wealth only, or
 * both together (the 3 real user flows). Doesn't change what's measured —
 * only what's surfaced across the dashboard, roadmap, and goal suggestions.
 */
export function FocusSelector({ focus, onChange }: { focus: ScoreFocus; onChange: (f: ScoreFocus) => void }) {
  return (
    <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
      {OPTIONS.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
            focus === o.value ? 'bg-white dark:bg-gray-900 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}>
          <span>{o.icon}</span>{o.label}
        </button>
      ))}
    </div>
  );
}
