'use client';
import { useState, useEffect } from 'react';
import { calcWaistHipRatio } from '@/lib/calc';
import { Shell, NumIn, Toggle, Stat, Box, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function WaistHipRatioCalc() {
  const [waist, setWaist] = useState(85);
  const [hip, setHip] = useState(100);
  const [female, setFemale] = useState(false);
  const r = calcWaistHipRatio(waist, hip, female ? 'female' : 'male');

  useEffect(() => {
    saveHistory({
      calcSlug: 'waist-hip-ratio', calcName: 'Waist-to-Hip Ratio Calculator',
      summary: `Ratio ${r.ratio} — ${r.risk}`,
      inputs: { waist, hip },
    });
  }, [waist, hip, female]);

  return (
    <Shell
      left={<>
        <div>
          <label className="calc-label">Sex</label>
          <Toggle v={female} a="Female" b="Male" onA={()=>setFemale(true)} onB={()=>setFemale(false)}/>
        </div>
        <NumIn label="Waist circumference (cm)" value={waist} onChange={setWaist} min={40} max={200} step={0.5}
          hint="Measure at the narrowest point, usually just above the navel"/>
        <NumIn label="Hip circumference (cm)" value={hip} onChange={setHip} min={50} max={250} step={0.5}
          hint="Measure at the widest point of your hips/buttocks"/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-teal-600 dark:text-teal-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Waist-to-Hip Ratio
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800">
            <p className="result-label text-teal-600 dark:text-teal-400">Your ratio</p>
            <p className="calc-num-lg text-teal-600 dark:text-teal-400">{r.ratio}</p>
          </div>
          <Stat label="Cardiovascular risk" value={r.risk} color={r.risk === 'Low risk' ? TC.green : r.risk === 'Moderate risk' ? TC.orange : 'text-red-500'}/>
        </div>
        <Box icon="💡 Why WHR matters" color="teal"
          text="Waist-to-hip ratio is a strong indicator of where body fat is stored. Fat carried around the abdomen (an 'apple' shape) is more strongly linked to cardiovascular and metabolic risk than fat carried on the hips and thighs (a 'pear' shape), even at the same total body weight."/>
      </>}
    />
  );
}
