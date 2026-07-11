'use client';
import { useState, useEffect } from 'react';
import { calcPlateLoad } from '@/lib/calc';
import { Shell, NumIn, SelectIn, Stat, Box } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function PlateLoadCalc() {
  const [target, setTarget] = useState(100);
  const [barWeight, setBarWeight] = useState(20);
  const r = calcPlateLoad(target, barWeight);

  useEffect(() => {
    saveHistory({
      calcSlug: 'one-rep-max-plates', calcName: 'Plate Calculator',
      summary: `${target}kg target — ${r.perSide}kg per side`,
      inputs: { target, barWeight },
    });
  }, [target, barWeight]);

  return (
    <Shell
      left={<>
        <NumIn label="Target total weight (kg)" value={target} onChange={setTarget} min={20} max={500} step={2.5}
          hint="Use your 1RM Calculator result, or any target weight"/>
        <SelectIn label="Bar weight" value={barWeight} onChange={v=>setBarWeight(+v)}
          options={[{value:20,label:'20kg — Standard Olympic bar'},{value:15,label:'15kg — Women\'s Olympic bar'},{value:10,label:'10kg — Training bar'}]}/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-teal-600 dark:text-teal-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Plates needed for {target}kg
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800">
            <p className="result-label text-teal-600 dark:text-teal-400">Per side</p>
            <p className="calc-num-lg text-teal-600 dark:text-teal-400">{r.perSide}kg</p>
          </div>
          <Stat label="Achieved total" value={`${r.achievedTotal}kg`} color="text-gray-600"/>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Load each side with</p>
          <div className="flex flex-wrap gap-2">
            {r.plates.length === 0 && <p className="text-sm text-gray-400">Just the bar — no plates needed.</p>}
            {r.plates.map(p => (
              <div key={p.plate} className="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-lg px-3 py-2">
                <span className="font-bold text-teal-700 dark:text-teal-400">{p.plate}kg</span>
                <span className="text-xs text-gray-400">× {p.count}</span>
              </div>
            ))}
          </div>
          {r.remainder > 0 && (
            <p className="text-xs text-orange-500 mt-3">⚠️ {r.remainder}kg per side can't be made exactly with a standard plate set — closest achievable total shown above.</p>
          )}
        </div>
        <Box icon="💡 Standard Olympic plate set" color="teal"
          text="Assumes a standard set: 25, 20, 15, 10, 5, 2.5, and 1.25kg plates per side, which is what most commercial gyms stock."/>
      </>}
    />
  );
}
