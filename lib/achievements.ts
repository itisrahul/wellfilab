/**
 * lib/achievements.ts — real milestones the user has actually reached.
 *
 * No fabricated timestamps ("3 days ago") since none of the underlying
 * storage keeps an event log — every entry here is a true statement about
 * the user's *current* standing (best score ever, current streak, phases
 * actually completed), not a reconstructed history.
 */

import type { WellFiScore } from './wellfilab-score';
import type { RoadmapProgressSummary } from './roadmapProgress';
import type { Goal } from './goalsStorage';

export interface Achievement {
  icon: string;
  label: string;
}

export function getAchievements(
  score: WellFiScore, history: WellFiScore[],
  roadmap: RoadmapProgressSummary | null, goals: Goal[]
): Achievement[] {
  const items: Achievement[] = [];

  const previous = history.filter(h => h.id !== score.id);
  if (previous.length > 0 && score.overall > Math.max(...previous.map(h => h.overall))) {
    items.push({ icon: '🎉', label: `New best score — ${score.overall}/100` });
  }

  if (score.streakDays >= 3) {
    items.push({ icon: '🔥', label: `${score.streakDays}-review streak` });
  }

  if (roadmap) {
    if (roadmap.activePhaseNum >= 2 || roadmap.pctComplete >= 100) {
      items.push({ icon: '✅', label: 'Phase 1 complete' });
    }
    if (roadmap.activePhaseNum >= 3) {
      items.push({ icon: '✅', label: 'Phase 2 complete' });
    }
  }

  const goalNearDone = goals.find(g => !g.paused && (() => {
    const span = g.target - g.startValue;
    if (span === 0) return false;
    const pct = ((g.current - g.startValue) / span) * 100;
    return pct >= 80 && pct < 100;
  })());
  if (goalNearDone) {
    items.push({ icon: '🎯', label: `Almost there on "${goalNearDone.label}"` });
  }

  return items.slice(0, 4);
}
