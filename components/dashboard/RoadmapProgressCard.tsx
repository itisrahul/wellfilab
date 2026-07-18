import Link from 'next/link';
import type { RoadmapProgressSummary } from '@/lib/roadmapProgress';
import { LinkChip, LinkBar } from './LinkChip';

export function RoadmapProgressCard({ started, progress }: { started: boolean; progress: RoadmapProgressSummary | null }) {
  if (!started || !progress || progress.totalActions === 0) {
    return (
      <div id="roadmap-progress" className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-5 h-full flex flex-col items-center justify-center text-center min-h-[220px]">
        <p className="text-3xl mb-3">🗺️</p>
        <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">Roadmap not started</p>
        <p className="text-xs text-gray-400 mb-4 max-w-xs">A personalised, phased plan built from your own score — free.</p>
        <Link href="/roadmap" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">View my roadmap →</Link>
      </div>
    );
  }

  const { doneCount, inProgressCount, pendingCount, totalActions, activePhaseNum, activePhaseLabel, pctComplete } = progress;
  const donePct = Math.round((doneCount / totalActions) * 100);
  const progressPct = Math.round((inProgressCount / totalActions) * 100);
  const pendingPct = 100 - donePct - progressPct;

  return (
    <div id="roadmap-progress" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <Link href="/roadmap" className="flex items-center justify-between mb-4 group">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Roadmap progress</p>
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform">View →</span>
      </Link>

      <div className="h-2.5 rounded-full overflow-hidden flex bg-gray-100 dark:bg-gray-800 mb-3">
        {donePct > 0 && <div className="h-full bg-teal-600" style={{ width: `${donePct}%` }} />}
        {progressPct > 0 && <div className="h-full bg-amber-500" style={{ width: `${progressPct}%` }} />}
        {pendingPct > 0 && <div className="h-full bg-gray-200 dark:bg-gray-700" style={{ width: `${pendingPct}%` }} />}
      </div>

      <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400 mb-3">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />Done ({doneCount})</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />In progress ({inProgressCount})</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 inline-block" />Pending ({pendingCount})</span>
      </div>

      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        Phase {activePhaseNum} — {activePhaseLabel} · <span className="font-mono tabular-nums">{pctComplete}%</span> complete
      </p>
      <LinkBar>
        <LinkChip targetId="top-priorities">Phase 1 = your Top Priorities</LinkChip>
      </LinkBar>
    </div>
  );
}
