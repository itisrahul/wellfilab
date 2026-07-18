import Link from 'next/link';
import type { Action } from '@/lib/wellfilab-score';
import { howEasyTime } from '@/lib/roadmapActions';
import { LinkChip, LinkBar } from './LinkChip';

function difficulty(howEasy: Action['howEasy']): string {
  return howEasy === 'today' ? 'Easy' : 'Moderate';
}

export function TopPriorities({ actions }: { actions: Action[] }) {
  const top = actions.slice(0, 3);

  if (top.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full flex flex-col items-center justify-center text-center min-h-[220px]">
        <p className="text-3xl mb-3">🎯</p>
        <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">No priorities yet</p>
        <p className="text-xs text-gray-400 mb-4 max-w-xs">Add your body and finance details to your score for a personalised, ranked action list.</p>
        <Link href="/score" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Complete my score →</Link>
      </div>
    );
  }

  return (
    <div id="top-priorities" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Top 3 priorities</p>
      <div className="space-y-3">
        {top.map(a => (
          <div key={a.rank} className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-mono tabular-nums font-bold flex items-center justify-center mt-0.5">
              {a.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{a.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">{a.why}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">{a.impact}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">{howEasyTime(a.howEasy)}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">{difficulty(a.howEasy)}</span>
              </div>
              {a.toolSlug && a.toolCat && (
                <Link href={`/tools/${a.toolCat}/${a.toolSlug}`} className="inline-block text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline mt-2">
                  Open tool →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
      <LinkBar>
        <LinkChip targetId="next-steps">Do #1 now — open Next Steps</LinkChip>
        <LinkChip targetId="roadmap-progress">These are Roadmap Phase 1</LinkChip>
      </LinkBar>
    </div>
  );
}
