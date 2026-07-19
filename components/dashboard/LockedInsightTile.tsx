import { Lock } from 'lucide-react';

/**
 * Honest placeholder for data WellFiLab doesn't have access to yet (wearable
 * metrics like heart rate/VO2 max, bank/investment account balances) —
 * shown greyed-out with a real "not built yet" state rather than either
 * hiding the concept entirely or, worse, faking a number. Every value on
 * this dashboard that isn't locked is real; this is how it stays that way
 * as more integrations get added later instead of invented now.
 */
export function LockedInsightTile({ icon, label, connectLabel }: { icon: string; label: string; connectLabel: string }) {
  return (
    <div className="relative p-4 rounded-2xl bg-gray-100/60 dark:bg-gray-800/40 border border-dashed border-gray-300 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl opacity-40">{icon}</span>
        <Lock size={14} className="text-gray-400" />
      </div>
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">{label}</p>
      <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-0.5">{connectLabel}</p>
    </div>
  );
}
