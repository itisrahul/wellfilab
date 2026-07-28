'use client';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { scoreColor } from '@/lib/wellfilab-score';

/**
 * The homepage hero's visual centerpiece — a polished mockup of an actual
 * score result screen, the same pattern Stripe/Linear/Vercel use (show the
 * real product, confidently) instead of an abstract diagram. Framed openly
 * as a sample result (the "SAMPLE RESULT" tag reads like a real UI badge,
 * not an apologetic disclaimer) since no visitor has taken the score yet —
 * every number here mirrors the actual WellFiLab Score's real structure
 * (overall + body/mind/wealth/life, same colors as everywhere else on the
 * site), not an invented shape.
 */
const DIMS = [
  { id: 'body', label: 'Body', score: 74, icon: '💪', color: '#0d9488' },
  { id: 'mind', label: 'Mind', score: 68, icon: '🧠', color: '#6366f1' },
  { id: 'wealth', label: 'Wealth', score: 61, icon: '💰', color: '#f59e0b' },
  { id: 'life', label: 'Life', score: 70, icon: '🌱', color: '#22c55e' },
];
const OVERALL = 70;

export function ScorePreviewCard() {
  const ringColor = scoreColor(OVERALL);
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-to-br from-teal-500/20 to-amber-400/20 rounded-[2rem] blur-2xl pointer-events-none" />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6 sm:p-7 rotate-1 hover:rotate-0 transition-transform duration-300">
        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-full">Sample Result</span>
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
            <span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
            <span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>

        <div className="flex items-center gap-5 mb-6">
          <div className="relative flex-shrink-0" style={{ width: 96, height: 96 }}>
            <ScoreRing pct={OVERALL} color={ringColor} size={96} thick={9} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono tabular-nums font-black text-3xl" style={{ color: ringColor }}>{OVERALL}</span>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">WellFiLab Score</p>
            <p className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight">The Rebuilder</p>
            <p className="text-xs text-gray-400 mt-0.5">Both engines have real room to grow</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {DIMS.map(d => (
            <div key={d.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm">{d.icon}</span>
                <span className="font-mono tabular-nums font-bold text-sm" style={{ color: d.color }}>{d.score}</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${d.score}%`, backgroundColor: d.color }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{d.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900">
          <span className="text-base flex-shrink-0">💡</span>
          <p className="text-[11px] text-teal-800 dark:text-teal-300 leading-relaxed">Your sleep debt is costing you focus — and money. Fix that first.</p>
        </div>
      </div>
    </div>
  );
}
