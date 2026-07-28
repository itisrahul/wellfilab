import Link from 'next/link';
import { Lightbulb } from 'lucide-react';
import type { Action } from '@/lib/wellfilab-score';
import { LinkChip, LinkBar } from './LinkChip';

/** The score algorithm's own ranked actions, real "why" and real impact
 * estimate — not an "AI insights" feature we don't actually have. Same
 * data source as the roadmap and the Do This Next card, just framed as
 * "what moves the needle most" here. */
export function TopOpportunitiesCard({ actions }: { actions: Action[] }) {
  const top = actions.slice(0, 2);
  return (
    <div id="top-priorities" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Top opportunities</p>
        <Link href="/roadmap" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">View all →</Link>
      </div>
      <div className="space-y-3">
        {top.map(a => (
          <div key={a.rank} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Lightbulb size={14} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{a.title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{a.why}</p>
              <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 mt-1">{a.impact}</p>
            </div>
          </div>
        ))}
        {top.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Take your score to see your top opportunities.</p>}
      </div>
      <LinkBar>
        <LinkChip targetId="roadmap-progress">These build your Roadmap</LinkChip>
      </LinkBar>
    </div>
  );
}
