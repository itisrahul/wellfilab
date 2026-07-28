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

  const { phases } = progress;
  const STATUS_STYLE: Record<typeof phases[number]['status'], string> = {
    completed: 'border-teal-400 bg-teal-50 dark:bg-teal-950/20',
    active: 'border-amber-300 bg-amber-50 dark:bg-amber-950/20',
    locked: 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900',
  };
  const STATUS_BADGE: Record<typeof phases[number]['status'], { label: string; className: string }> = {
    completed: { label: 'Completed', className: 'bg-teal-600 text-white' },
    active: { label: 'In progress', className: 'bg-amber-500 text-white' },
    locked: { label: 'Locked', className: 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400' },
  };

  return (
    <div id="roadmap-progress" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <Link href="/roadmap" className="flex items-center justify-between mb-4 group">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Roadmap progress</p>
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform">View →</span>
      </Link>

      <div className="grid grid-cols-3 gap-2.5">
        {phases.map(p => (
          <div key={p.num} className={`rounded-xl border-2 p-2.5 ${STATUS_STYLE[p.status]}`}>
            <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">Phase {p.num} · {p.label}</p>
            <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-full mb-1.5 ${STATUS_BADGE[p.status].className}`}>{STATUS_BADGE[p.status].label}</span>
            <p className="font-mono tabular-nums text-xs font-black text-gray-900 dark:text-white">{p.status === 'locked' ? '—' : `${p.pct}%`}</p>
          </div>
        ))}
      </div>
      <LinkBar>
        <LinkChip targetId="top-priorities">Phase 1 = your Top Priorities</LinkChip>
      </LinkBar>
    </div>
  );
}
