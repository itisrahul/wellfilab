import Link from 'next/link';
import { scoreColor, type WellFiScore } from '@/lib/wellfilab-score';
import { DIMENSIONS } from '@/lib/dimensionTheme';
import type { ScoreFocus } from '@/lib/scoreFocus';
import { LinkChip, LinkBar } from './LinkChip';

// Life is a derived cross-pillar balance metric — it doesn't cleanly belong
// to a Health-only or Wealth-only view, so it only shows in "Both".
const FOCUS_KEYS: Record<ScoreFocus, ('body' | 'mind' | 'wealth' | 'life')[]> = {
  health: ['body', 'mind'], wealth: ['wealth'], both: ['body', 'mind', 'wealth', 'life'],
};

export function ScoreBand({ score, focus = 'both' }: { score: WellFiScore; focus?: ScoreFocus }) {
  const delta = score.scoreChange;
  const shownDims = DIMENSIONS.filter(d => FOCUS_KEYS[focus].includes(d.key));
  const weakest = shownDims.reduce((a, b) => (score[b.key] < score[a.key] ? b : a), shownDims[0]);

  return (
    <div id="score-band" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">

        {/* Score hero + delta */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">WellFiLab Score</p>
            <div className="flex items-baseline gap-1">
              <span className="font-mono tabular-nums text-5xl sm:text-6xl font-black leading-none" style={{ color: scoreColor(score.overall) }}>
                {score.overall}
              </span>
              <span className="text-gray-300 dark:text-gray-600 text-lg font-bold">/100</span>
            </div>
          </div>
          {delta != null && delta !== 0 && (
            <span className={`font-mono tabular-nums text-xs font-bold px-2.5 py-1 rounded-full ${delta > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'}`}>
              {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}
            </span>
          )}
        </div>

        {/* Dimension mini-bars — filtered to the chosen focus */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 flex-1 sm:border-l sm:border-gray-100 sm:dark:border-gray-800 sm:pl-6"
          style={{ gridTemplateColumns: `repeat(${Math.min(4, Math.max(2, shownDims.length))}, minmax(0, 1fr))` }}>
          {shownDims.map(d => (
            <div key={d.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">{d.icon} {d.label}</span>
                <span className="font-mono tabular-nums text-[11px] font-bold text-gray-900 dark:text-white">{score[d.key]}</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${d.bar}`} style={{ width: `${score[d.key]}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3 flex-shrink-0 sm:border-l sm:border-gray-100 sm:dark:border-gray-800 sm:pl-6">
          <Link href="/score?retake=1" className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 whitespace-nowrap">
            🔄 Retake score
          </Link>
          <Link href="/score" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline whitespace-nowrap">
            Full breakdown →
          </Link>
        </div>
      </div>
      <LinkBar>
        <LinkChip targetId="top-priorities">{weakest.label} is lowest — see Top Priorities</LinkChip>
        <LinkChip targetId="risk-alerts">{weakest.label} is lowest — see Risk Alerts</LinkChip>
      </LinkBar>
    </div>
  );
}
