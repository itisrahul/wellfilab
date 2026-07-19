/**
 * lib/roadmapProgress.ts — real roadmap-completion summary, shared with app/roadmap/page.tsx.
 *
 * Mirrors the phase/checked-count logic that lives inline in the roadmap page
 * (phase1/2/3 action banks, unlock thresholds) so the dashboard's Roadmap
 * Progress widget reads the exact same real numbers instead of a second,
 * drift-prone estimate of "how far along" the user is.
 */

import { getDimActions } from './roadmapActions';
import { dimMatchesFocus, type ScoreFocus } from './scoreFocus';
import type { RoadmapChecks } from './roadmapChecks';
import type { WellFiScore, BodyInputs, FinanceInputs } from './wellfilab-score';

export interface RoadmapProgressSummary {
  totalActions: number;
  totalChecked: number;
  activePhaseNum: 1 | 2 | 3;
  activePhaseLabel: string;
  activePhaseTotal: number;
  activePhaseChecked: number;
  doneCount: number;
  inProgressCount: number;
  pendingCount: number;
  pctComplete: number;
  /** The real, currently-active phase's actions with their real checked
   * state — same titles the roadmap page itself generates (getDimActions),
   * not a second copy. Powers the dashboard's Action Plan timeline. */
  activePhaseActions: { title: string; checked: boolean }[];
}

const PHASE_LABEL: Record<1 | 2 | 3, string> = { 1: 'Foundation', 2: 'Building', 3: 'Growing' };

export function computeRoadmapProgress(
  score: WellFiScore, body: BodyInputs | null, finance: FinanceInputs | null,
  checks: RoadmapChecks, focus: ScoreFocus = 'both'
): RoadmapProgressSummary {
  // Falls back to every dimension if the focus filter would leave none —
  // e.g. a 'quick'-level score's dimensions are coarse (body/mind/wealth/life)
  // and don't match the fine-grained health/wealth id sets at all.
  const focused = score.dimensions.filter(d => dimMatchesFocus(d.id, focus));
  const sortedDims = [...(focused.length > 0 ? focused : score.dimensions)].sort((a, b) => a.score - b.score);
  const lowestDim = sortedDims[0];
  const secondDim = sortedDims[1];
  const thirdDim = sortedDims[2];

  const phase1Extras = getDimActions(lowestDim.id, lowestDim, body, finance).slice(0, 2);
  const focusCategories: Record<ScoreFocus, string[]> = {
    health: ['health', 'mind', 'both'], wealth: ['finance', 'both'], both: ['health', 'mind', 'finance', 'both'],
  };
  const focusedActions = score.actions.filter(a => focusCategories[focus].includes(a.category));
  const phase1AlgoActions = (focusedActions.length > 0 ? focusedActions : score.actions).slice(0, 3);
  const phase1Total = phase1AlgoActions.length + phase1Extras.length;
  const phase1Checked = phase1AlgoActions.map((_, i) => checks[`p1-alg-${i}`]).filter(Boolean).length
    + phase1Extras.map((_, i) => checks[`p1-extra-${i}`]).filter(Boolean).length;

  const phase2Actions = secondDim ? getDimActions(secondDim.id, secondDim, body, finance) : [];
  const phase2Total = phase2Actions.length;
  const phase2Checked = phase2Actions.map((_, i) => checks[`p2-${i}`]).filter(Boolean).length;
  const phase2Unlocked = phase1Checked >= 2;

  const phase3Actions = thirdDim ? getDimActions(thirdDim.id, thirdDim, body, finance) : [];
  const phase3Total = phase3Actions.length;
  const phase3Checked = phase3Actions.map((_, i) => checks[`p3-${i}`]).filter(Boolean).length;
  const phase3Unlocked = phase2Checked >= 2;

  const totalActions = phase1Total + phase2Total + phase3Total;
  const totalChecked = phase1Checked + phase2Checked + phase3Checked;
  const activePhaseNum: 1 | 2 | 3 = phase3Unlocked ? 3 : phase2Unlocked ? 2 : 1;
  const [activePhaseTotal, activePhaseChecked] =
    activePhaseNum === 1 ? [phase1Total, phase1Checked] :
    activePhaseNum === 2 ? [phase2Total, phase2Checked] : [phase3Total, phase3Checked];

  const doneCount = totalChecked;
  const inProgressCount = Math.max(0, activePhaseTotal - activePhaseChecked);
  const pendingCount = Math.max(0, totalActions - doneCount - inProgressCount);

  const activePhaseActions: { title: string; checked: boolean }[] =
    activePhaseNum === 1
      ? [
          ...phase1AlgoActions.map((a, i) => ({ title: a.title, checked: !!checks[`p1-alg-${i}`] })),
          ...phase1Extras.map((a, i) => ({ title: a.title, checked: !!checks[`p1-extra-${i}`] })),
        ]
      : activePhaseNum === 2
      ? phase2Actions.map((a, i) => ({ title: a.title, checked: !!checks[`p2-${i}`] }))
      : phase3Actions.map((a, i) => ({ title: a.title, checked: !!checks[`p3-${i}`] }));

  return {
    totalActions, totalChecked,
    activePhaseNum, activePhaseLabel: PHASE_LABEL[activePhaseNum],
    activePhaseTotal, activePhaseChecked,
    doneCount, inProgressCount, pendingCount,
    pctComplete: totalActions > 0 ? Math.round((totalChecked / totalActions) * 100) : 0,
    activePhaseActions,
  };
}
