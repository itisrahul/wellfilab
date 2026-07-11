'use client';
import { useState, useEffect } from 'react';
import { calcProteinIntake } from '@/lib/calc';
import { Shell, NumIn, SelectIn, Stat, Box } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function ProteinIntakeCalc() {
  const [weight, setWeight] = useState(70);
  const [activity, setActivity] = useState<'sedentary'|'moderate'|'active'|'athlete'>('moderate');
  const [goal, setGoal] = useState<'maintain'|'lose'|'build_muscle'>('maintain');
  const r = calcProteinIntake(weight, activity, goal);

  useEffect(() => {
    saveHistory({
      calcSlug: 'protein-intake', calcName: 'Protein Intake Calculator',
      summary: `${r.gramsLow}-${r.gramsHigh}g protein/day target`,
      inputs: { weight },
    });
  }, [weight, activity, goal]);

  return (
    <Shell
      left={<>
        <NumIn label="Body weight (kg)" value={weight} onChange={setWeight} min={20} max={300} step={0.5}/>
        <SelectIn label="Activity level" value={activity} onChange={v=>setActivity(v as any)}
          options={[
            {value:'sedentary',label:'Sedentary (little/no exercise)'},
            {value:'moderate',label:'Moderate (3-4x/week training)'},
            {value:'active',label:'Active (daily training)'},
            {value:'athlete',label:'Athlete (intense daily training)'},
          ]}/>
        <SelectIn label="Goal" value={goal} onChange={v=>setGoal(v as any)}
          options={[
            {value:'maintain',label:'Maintain weight'},
            {value:'lose',label:'Lose fat (calorie deficit)'},
            {value:'build_muscle',label:'Build muscle'},
          ]}/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-teal-600 dark:text-teal-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Daily protein target
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card col-span-2 bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800">
            <p className="result-label text-teal-600 dark:text-teal-400">Recommended range</p>
            <p className="calc-num-lg text-teal-600 dark:text-teal-400">{r.gramsLow}–{r.gramsHigh}g/day</p>
          </div>
          <Stat label="Per meal (4 meals/day)" value={`${r.perMealLow}–${r.perMealHigh}g`} color="text-gray-600"/>
        </div>
        <Box icon="💡 Why protein needs scale with activity" color="teal"
          text="Resistance training and a calorie deficit both increase protein needs — training creates more muscle to repair, and a deficit raises the risk of losing lean mass alongside fat without enough protein to protect it. This calculator's range scales for both factors rather than using one flat number for everyone."/>
      </>}
    />
  );
}
