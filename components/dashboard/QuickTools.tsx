import Link from 'next/link';
import { daysAgo, type CalcHistoryEntry } from '@/lib/dashboardData';
import type { Action } from '@/lib/wellfilab-score';

const DEFAULT_TOOLS = [
  { icon: '⚖️', name: 'BMI',        slug: 'bmi',        url: '/tools/health/bmi' },
  { icon: '🔥', name: 'Calories',   slug: 'calories',   url: '/tools/health/calories' },
  { icon: '😴', name: 'Sleep',      slug: 'sleep',       url: '/tools/health/sleep' },
  { icon: '💹', name: 'SIP',        slug: 'sip',         url: '/tools/finance/sip' },
  { icon: '🔥', name: 'FIRE',       slug: 'fire',        url: '/tools/finance/fire' },
  { icon: '🌅', name: 'Retirement', slug: 'retirement', url: '/tools/finance/retirement' },
];

interface Props {
  actions: Action[];
  calcHistory: CalcHistoryEntry[];
}

export function QuickTools({ actions, calcHistory }: Props) {
  const fromActions = actions
    .filter(a => a.toolSlug && a.toolCat)
    .map(a => ({ icon: '🧮', name: a.title, slug: a.toolSlug!, url: `/tools/${a.toolCat}/${a.toolSlug}` }));

  const seen = new Set<string>();
  const merged = [...fromActions, ...DEFAULT_TOOLS].filter(t => {
    if (seen.has(t.url)) return false;
    seen.add(t.url);
    return true;
  }).slice(0, 6);

  const lastUsedFor = (slug: string) => calcHistory.find(e => e.calcSlug === slug)?.timestamp;

  return (
    <section>
      <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Quick tools</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {merged.map(t => {
          const lastUsed = lastUsedFor(t.slug);
          return (
            <Link key={t.url} href={t.url}
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-sm transition-all group">
              <span className="text-2xl flex-shrink-0">{t.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">{t.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{lastUsed ? `Last used: ${daysAgo(lastUsed)}` : 'Not used yet'}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
