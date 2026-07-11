'use client';
import { useState, useEffect } from 'react';
import { calcOvulation } from '@/lib/calc';
import { Shell, Label, NumIn, Box } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function OvulationCalc() {
  const [lmp, setLmp] = useState('');
  const [cycle, setCycle] = useState(28);
  const r = lmp ? calcOvulation(new Date(lmp), cycle) : null;

  useEffect(() => {
    if (r) {
      saveHistory({
        calcSlug: 'ovulation', calcName: 'Ovulation Calculator',
        summary: `Ovulation: ${r.ovulationDate.toLocaleDateString()} — fertile window ${r.fertileStart.toLocaleDateString()} to ${r.fertileEnd.toLocaleDateString()}`,
        inputs: { cycle },
      });
    }
  }, [lmp, cycle]);

  return (
    <Shell
      left={<>
        <div>
          <Label>First day of last period (LMP)</Label>
          <input type="date" value={lmp} max={new Date().toISOString().split('T')[0]}
            onChange={e => setLmp(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-teal-500"/>
        </div>
        <NumIn label="Average cycle length (days)" value={cycle} onChange={setCycle} min={20} max={45}
          hint="Most cycles range 21-35 days. Count from the first day of one period to the first day of the next."/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Estimated fertile window
        </h3>
        {r ? <>
          <div className="text-center py-6">
            <div className="text-5xl mb-3">🌸</div>
            <p className="text-2xl font-extrabold text-pink-600 dark:text-pink-400">
              {r.ovulationDate.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
            </p>
            <p className="text-xs text-gray-400 mt-1">Estimated ovulation day</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-3 text-center border border-pink-100 dark:border-pink-900/30">
              <p className="text-sm font-bold text-pink-600">{r.fertileStart.toLocaleDateString('en-US',{month:'short',day:'numeric'})} – {r.fertileEnd.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</p>
              <p className="text-xs text-gray-400 mt-0.5">Fertile window</p>
            </div>
            <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-3 text-center border border-pink-100 dark:border-pink-900/30">
              <p className="text-sm font-bold text-pink-600">{r.nextPeriod.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</p>
              <p className="text-xs text-gray-400 mt-0.5">Next period (est.)</p>
            </div>
          </div>
          <Box icon="💡 This is an estimate" color="teal"
            text="Ovulation timing is calculated assuming a consistent luteal phase of 14 days, which holds reasonably well for most people but varies cycle to cycle. Tracking basal body temperature or using ovulation predictor kits gives a more precise read for your specific cycle."/>
        </> : <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Enter the first day of your last period to see your estimated fertile window.</div>}
      </>}
    />
  );
}
