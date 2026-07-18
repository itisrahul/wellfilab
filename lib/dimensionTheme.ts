/**
 * lib/dimensionTheme.ts — the 4 categorical dimension colors, one place.
 *
 * Teal/indigo/amber/green as brand-identity colors for Body/Mind/Wealth/Life,
 * kept strictly separate from status red (risk/critical) and status emerald
 * (score-delta positive) — categorical identity never doubles as state.
 * -600 dark-mode steps were validated against the dark surface with the
 * dataviz skill's palette validator; -500 is the light-mode step.
 */

export const DIMENSIONS: {
  key: 'body' | 'mind' | 'wealth' | 'life';
  label: string; icon: string; bar: string; text: string;
}[] = [
  { key: 'body',   label: 'Body',   icon: '💪', bar: 'bg-teal-500',   text: 'text-teal-700 dark:text-teal-400' },
  { key: 'mind',   label: 'Mind',   icon: '🧠', bar: 'bg-indigo-500 dark:bg-indigo-600', text: 'text-indigo-700 dark:text-indigo-400' },
  { key: 'wealth', label: 'Wealth', icon: '💰', bar: 'bg-amber-500 dark:bg-amber-600',   text: 'text-amber-700 dark:text-amber-400' },
  { key: 'life',   label: 'Life',   icon: '🌱', bar: 'bg-green-500 dark:bg-green-600',   text: 'text-green-700 dark:text-green-400' },
];
