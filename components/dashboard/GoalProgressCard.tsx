import Link from 'next/link';
import { GOAL_TYPE_META, type Goal } from '@/lib/goalsStorage';
import { estimateGoalETA, getGoalPaceStatus, type GoalPaceStatus } from '@/lib/goalPace';
import { fmtINR } from '@/lib/roadmapActions';
import type { ScoreFocus } from '@/lib/scoreFocus';
import { LinkChip, LinkBar } from './LinkChip';

function fmtValue(n: number, unit: string): string {
  if (unit.startsWith('₹')) return `${fmtINR(Math.round(n))}${unit.slice(1)}`;
  return `${n.toLocaleString('en-IN')}${unit ? ` ${unit}` : ''}`;
}

const PACE_BADGE: Record<GoalPaceStatus, { label: string; className: string }> = {
  ahead:    { label: 'Ahead of schedule',  className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
  'on-track': { label: 'On track',         className: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400' },
  behind:   { label: 'Behind schedule',    className: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400' },
};

function progressPct(g: Goal): number {
  const span = g.target - g.startValue;
  if (span === 0) return g.current === g.target ? 100 : 0;
  return Math.max(0, Math.min(100, ((g.current - g.startValue) / span) * 100));
}

export function GoalProgressCard({ goals, focus = 'both' }: { goals: Goal[]; focus?: ScoreFocus }) {
  // 'score' category goals are cross-cutting (a WellFiLab Score target isn't
  // purely health or wealth) so they stay visible in either single-focus view.
  const active = goals.filter(g => !g.paused && (focus === 'both' || GOAL_TYPE_META[g.type].category === focus || GOAL_TYPE_META[g.type].category === 'score'));

  if (active.length === 0) {
    return (
      <div id="goal-progress" className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-5 h-full flex flex-col items-center justify-center text-center min-h-[220px]">
        <p className="text-3xl mb-3">🧭</p>
        <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">No goals set</p>
        <p className="text-xs text-gray-400 mb-4 max-w-xs">Set a health or wealth target and track real progress toward it every month.</p>
        <Link href="/goals" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Set my first goal →</Link>
      </div>
    );
  }

  return (
    <div id="goal-progress" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Goal progress</p>
        <Link href="/goals" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">View all →</Link>
      </div>
      <div className="space-y-4">
        {active.slice(0, 4).map(g => {
          const meta = GOAL_TYPE_META[g.type];
          const pct = Math.round(progressPct(g));
          const eta = estimateGoalETA(g);
          const paceStatus = getGoalPaceStatus(g);
          return (
            <div key={g.id}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate flex items-center gap-1.5">
                  <span>{meta.icon}</span>{g.label}
                </span>
                <span className="font-mono tabular-nums text-[11px] text-gray-400 flex-shrink-0">
                  {fmtValue(g.current, meta.unit)} <span className="text-gray-300 dark:text-gray-600">/</span> {fmtValue(g.target, meta.unit)}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-[11px] text-gray-400">
                  <span className="font-mono tabular-nums">{pct}%</span> complete{eta ? ` · ${eta}` : ''}
                </p>
                {paceStatus && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${PACE_BADGE[paceStatus].className}`}>{PACE_BADGE[paceStatus].label}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <LinkBar>
        <LinkChip targetId="net-worth">Backed by your Net Worth snapshots</LinkChip>
        <LinkChip targetId="roadmap-progress">Next lever — see Roadmap Progress</LinkChip>
      </LinkBar>
    </div>
  );
}
