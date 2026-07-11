'use client';
import { useState, useEffect } from 'react';
import { calcFiberIntake } from '@/lib/calc';
import { Shell, NumIn, Toggle, Stat, Box, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function FiberIntakeCalc() {
  const [age, setAge] = useState(30);
  const [female, setFemale] = useState(false);
  const [current, setCurrent] = useState(15);
  const r = calcFiberIntake(age, female ? 'female' : 'male', current);

  useEffect(() => {
    saveHistory({
      calcSlug: 'fiber-intake', calcName: 'Fiber Intake Calculator',
      summary: `RDA ${r.rda}g — currently at ${r.pctOfTarget}% of target`,
      inputs: { age, current },
    });
  }, [age, female, current]);

  return (
    <Shell
      left={<>
        <NumIn label="Age" value={age} onChange={setAge} min={2} max={100}/>
        <div>
          <label className="calc-label">Sex</label>
          <Toggle v={female} a="Female" b="Male" onA={()=>setFemale(true)} onB={()=>setFemale(false)}/>
        </div>
        <NumIn label="Current daily fiber intake (g)" value={current} onChange={setCurrent} min={0} max={100} step={1}
          hint="Most people underestimate this — check nutrition labels for a few typical days"/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-teal-600 dark:text-teal-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Your daily fiber target
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800">
            <p className="result-label text-teal-600 dark:text-teal-400">Recommended (RDA)</p>
            <p className="calc-num-lg text-teal-600 dark:text-teal-400">{r.rda}g</p>
          </div>
          <Stat label="Gap to close" value={`${r.gap}g`} color={r.gap > 0 ? TC.orange : TC.green}/>
          <Stat label="% of target met" value={`${r.pctOfTarget}%`} color={r.pctOfTarget >= 100 ? TC.green : TC.orange}/>
        </div>
        <Box icon="💡 Most people fall short" color="teal"
          text="Average fiber intake in many populations is well below the recommended 25-38g/day. Good sources include legumes, whole grains, fruits with skin on, and vegetables — increase intake gradually with plenty of water to avoid digestive discomfort."/>
      </>}
    />
  );
}
