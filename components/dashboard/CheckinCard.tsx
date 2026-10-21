'use client';
import { useState } from 'react';
import { saveTodayCheckin, getLastNDays, type CheckinEntry } from '@/lib/dashboardCheckins';
import { fmtINR } from '@/lib/roadmapActions';

function Bars({ title, sub, values, max, color }: { title: string; sub: string; values: { label: string; v: number }[]; max: number; color: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{title}</p>
        <p className="text-[11px] text-gray-400">{sub}</p>
      </div>
      <div className="flex items-end gap-1.5" style={{ height: 56 }}>
        {values.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div className="w-full rounded-t-sm transition-all duration-500" style={{ height: `${max > 0 ? Math.max(4, (d.v / max) * 100) : 4}%`, backgroundColor: color, opacity: i === values.length - 1 ? 1 : 0.55 }} />
            <span className="text-[9px] text-gray-400">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * A lighter-weight, more-frequent log than the full WellFiLab Score —
 * local-only for now (see lib/dashboardCheckins.ts). Doesn't feed the real
 * Body/Mind/Wealth/Life score; it's a separate daily habit-tracking layer.
 */
export function CheckinCard({ initial }: { initial: CheckinEntry | null }) {
  const [sleepHours, setSleepHours] = useState(initial?.sleepHours ?? 7);
  const [waterGlasses, setWaterGlasses] = useState(initial?.waterGlasses ?? 6);
  const [movementMinutes, setMovementMinutes] = useState(initial?.movementMinutes ?? 20);
  const [spentToday, setSpentToday] = useState(initial?.spentToday ?? 0);
  const [stressLevel, setStressLevel] = useState(initial?.stressLevel ?? 5);
  const [mood, setMood] = useState(initial?.mood ?? 3);
  const [saved, setSaved] = useState(false);
  const [trend, setTrend] = useState(() => getLastNDays(7));

  const handleSave = () => {
    saveTodayCheckin({ sleepHours, waterGlasses, movementMinutes, spentToday, stressLevel, mood });
    setTrend(getLastNDays(7));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const maxSleep = Math.max(8, ...trend.map(d => d.sleepHours));
  const maxWater = Math.max(8, ...trend.map(d => d.waterGlasses));
  const maxSpend = Math.max(1, ...trend.map(d => d.spentToday));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Today's check-in</p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Sleep', unit: 'hours', value: sleepHours, set: setSleepHours, step: 0.5, min: 0, max: 14 },
          { label: 'Water', unit: 'glasses', value: waterGlasses, set: setWaterGlasses, step: 1, min: 0, max: 20 },
          { label: 'Movement', unit: 'minutes', value: movementMinutes, set: setMovementMinutes, step: 5, min: 0, max: 300 },
          { label: 'Spent today', unit: '₹', value: spentToday, set: setSpentToday, step: 50, min: 0, max: 200000 },
          { label: 'Stress', unit: 'of 10', value: stressLevel, set: setStressLevel, step: 1, min: 1, max: 10 },
        ].map(f => (
          <label key={f.label} className="grid gap-1 text-[11px] text-gray-400">
            {f.label}
            <input type="number" value={f.value} step={f.step} min={f.min} max={f.max}
              onChange={e => f.set(+e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border-[1.5px] border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-base font-bold text-gray-900 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-teal-400" />
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
        <div className="flex-1 min-w-[220px]">
          <p className="text-[11px] text-gray-400 mb-1.5">Mood</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(m => (
              <button key={m} type="button" onClick={() => setMood(m)}
                className={`flex-1 py-2 rounded-lg border-[1.5px] font-bold text-sm transition-colors ${
                  mood === m ? 'bg-teal-600 border-teal-600 text-white' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-teal-400'
                }`}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <button type="button" onClick={handleSave}
          className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-colors">
          {saved ? 'Saved ✓' : 'Save check-in'}
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Bars title="Sleep" sub={`avg ${(trend.reduce((s, d) => s + d.sleepHours, 0) / 7).toFixed(1)}h`} values={trend.map(d => ({ label: d.label, v: d.sleepHours }))} max={maxSleep} color="#6366f1" />
        <Bars title="Water" sub={`avg ${(trend.reduce((s, d) => s + d.waterGlasses, 0) / 7).toFixed(1)} glasses`} values={trend.map(d => ({ label: d.label, v: d.waterGlasses }))} max={maxWater} color="#0d9488" />
        <Bars title="Spending" sub={fmtINR(trend.reduce((s, d) => s + d.spentToday, 0)) + ' this week'} values={trend.map(d => ({ label: d.label, v: d.spentToday }))} max={maxSpend} color="#f59e0b" />
      </div>
    </div>
  );
}
