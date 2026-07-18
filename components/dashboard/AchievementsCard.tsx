import type { Achievement } from '@/lib/achievements';
import { LinkChip, LinkBar } from './LinkChip';

export function AchievementsCard({ achievements }: { achievements: Achievement[] }) {
  if (achievements.length === 0) {
    return (
      <div id="achievements" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full flex flex-col items-center justify-center text-center min-h-[220px]">
        <p className="text-3xl mb-3">🏁</p>
        <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">No milestones yet</p>
        <p className="text-xs text-gray-400 max-w-xs">Beat a previous score, build a streak, or finish a roadmap phase to see it here.</p>
      </div>
    );
  }

  return (
    <div id="achievements" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Achievements</p>
      <div className="space-y-2.5">
        {achievements.map((a, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <span className="text-lg flex-shrink-0">{a.icon}</span>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{a.label}</p>
          </div>
        ))}
      </div>
      <LinkBar>
        <LinkChip targetId="goal-progress">Source: Goal Progress</LinkChip>
        <LinkChip targetId="roadmap-progress">Source: Roadmap Progress</LinkChip>
      </LinkBar>
    </div>
  );
}
