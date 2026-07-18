import type { RiskAlert } from '@/lib/riskAlerts';

export function RiskAlertsCard({ alerts }: { alerts: RiskAlert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full flex flex-col items-center justify-center text-center min-h-[220px]">
        <p className="text-3xl mb-3">✅</p>
        <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">No active risk alerts</p>
        <p className="text-xs text-gray-400 max-w-xs">Nothing in your current numbers is flagging a specific exposure.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Risk alerts</p>
      <div className="space-y-3">
        {alerts.map((r, i) => (
          <div key={i} className="flex gap-3 pl-3 border-l-2 border-red-600">
            <span className="flex-shrink-0 text-lg leading-none">{r.icon}</span>
            <div className="min-w-0">
              <p className="font-bold text-red-700 dark:text-red-400 text-xs mb-1">{r.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{r.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
