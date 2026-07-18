import Link from 'next/link';
import type { Action } from '@/lib/wellfilab-score';
import { howEasyTime } from '@/lib/roadmapActions';
import type { ScoreFocus } from '@/lib/scoreFocus';
import { LinkChip, LinkBar } from './LinkChip';

function difficulty(howEasy: Action['howEasy']): string {
  return howEasy === 'today' ? 'Easy' : 'Moderate';
}

const FOCUS_CATEGORIES: Record<ScoreFocus, Action['category'][]> = {
  health: ['health', 'mind', 'both'], wealth: ['finance', 'both'], both: ['health', 'mind', 'finance', 'both'],
};

export function TopPriorities({ actions, focus = 'both' }: { actions: Action[]; focus?: ScoreFocus }) {
  const top = actions.filter(a => FOCUS_CATEGORIES[focus].includes(a.category)).slice(0, 3);

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

  const [hero, ...rest] = top;

  return (
    <div id="top-priorities" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Today's top priority</p>

      {/* #1 — the one action, promoted and fully explained */}
      <div className="flex gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-600 text-white text-sm font-mono tabular-nums font-bold flex items-center justify-center mt-0.5">
          {hero.rank}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-900 dark:text-white text-base mb-1.5">{hero.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-2.5">{hero.why}</p>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">{hero.impact}</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">{howEasyTime(hero.howEasy)}</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">{difficulty(hero.howEasy)}</span>
          </div>
          {hero.toolSlug && hero.toolCat && (
            <Link href={`/tools/${hero.toolCat}/${hero.toolSlug}`} className="inline-block text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline mt-2">
              Open tool →
            </Link>
          )}
        </div>
      </div>

      {/* #2 / #3 — collapsed to a single line each, so the page still has one clear "do this" without hiding the rest of the plan */}
      {rest.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600">Also worth doing this week</p>
          {rest.map(a => (
            <div key={a.rank} className="flex items-center gap-2.5">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[9px] font-mono tabular-nums font-bold flex items-center justify-center">
                {a.rank}
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1">{a.title}</p>
              <span className="flex-shrink-0 text-[10px] font-semibold text-teal-600 dark:text-teal-400">{a.impact}</span>
            </div>
          ))}
        </div>
      )}

      <LinkBar>
        <LinkChip targetId="next-steps">Do it now — open Next Steps</LinkChip>
        <LinkChip targetId="roadmap-progress">This is Roadmap Phase 1</LinkChip>
      </LinkBar>
    </div>
  );
}
