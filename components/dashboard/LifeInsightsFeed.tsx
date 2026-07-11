import type { LifeROIHistoryEntry } from '@/lib/dashboardData';
import type { LifeROIInsight } from '@/lib/lifeROI';

const TYPE_BADGE: Record<string, string> = {
  warning:     'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  opportunity: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  achievement: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  connection:  'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
};

const GENERIC_INSIGHTS: LifeROIInsight[] = [
  { emoji: '😴', title: 'Sleep debt has a price tag', description: 'Poor sleep costs the average person roughly ₹1.2L/year in lost productivity — before any medical costs.', type: 'connection' },
  { emoji: '💪', title: 'Exercise pays twice', description: 'Regular exercise both lowers long-run medical spend and improves the focus that drives better financial decisions.', type: 'connection' },
  { emoji: '📈', title: 'Small SIPs compound into real money', description: 'A ₹5,000/month SIP at 12% for 15 years grows to roughly ₹25 lakh — starting early matters more than starting big.', type: 'opportunity' },
];

export function LifeInsightsFeed({ lifeRoiHistory }: { lifeRoiHistory: LifeROIHistoryEntry[] }) {
  const latest = lifeRoiHistory[0];
  const insights = latest?.insights ?? [];

  const items = insights.length > 0 ? insights : GENERIC_INSIGHTS;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">💡 Life Insights</p>
      <p className="text-xs text-gray-400 mb-4">
        {insights.length > 0 ? 'Where your health and money connect' : 'Did you know?'}
      </p>
      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
        {items.map((ins, i) => (
          <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-800 p-3.5">
            <div className="flex items-start gap-2.5">
              <span className="text-xl flex-shrink-0">{ins.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{ins.title}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${TYPE_BADGE[ins.type] ?? TYPE_BADGE.connection}`}>{ins.type}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{ins.description}</p>
                {'financialValue' in ins && ins.financialValue != null && ins.financialValue > 0 && (
                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1.5">
                    ₹{ins.financialValue.toLocaleString('en-IN')}/yr
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
