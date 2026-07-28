import type { BodyInputs } from '@/lib/wellfilab-score';
import { LockedInsightTile } from './LockedInsightTile';

function StatTile({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) {
  return (
    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
      <p className="text-base mb-1.5">{icon}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className="font-mono tabular-nums font-bold text-sm text-gray-900 dark:text-white">{value}</p>
      <p className="text-[10px] text-gray-400">{sub}</p>
    </div>
  );
}

/** Compact real-data tile grid — sleep and stress come straight from the
 * body inputs the user entered; activity/recovery stay honestly locked
 * since there's no wearable integration to source them from. */
export function HealthOverviewCard({ body }: { body: BodyInputs | null }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Health overview</p>
      <div className="grid grid-cols-2 gap-3">
        {body?.sleepHours != null ? (
          <StatTile icon="🌙" label="Sleep (avg)" value={`${body.sleepHours}h`} sub={body.sleepHours >= 7 ? 'Good' : body.sleepHours >= 6 ? 'Fair' : 'Low'} />
        ) : (
          <LockedInsightTile icon="🌙" label="Sleep" connectLabel="Add on the score" />
        )}
        {body?.stressLevel != null ? (
          <StatTile icon="🧘" label="Stress (1-10)" value={`${body.stressLevel}`} sub={body.stressLevel <= 4 ? 'Low' : body.stressLevel <= 7 ? 'Moderate' : 'High'} />
        ) : (
          <LockedInsightTile icon="🧘" label="Stress" connectLabel="Add on the score" />
        )}
        <LockedInsightTile icon="🔥" label="Activity" connectLabel="Connect a wearable" />
        <LockedInsightTile icon="💪" label="Recovery" connectLabel="Connect a wearable" />
      </div>
    </div>
  );
}
