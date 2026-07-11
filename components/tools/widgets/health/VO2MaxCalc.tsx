'use client';
import { useState, useEffect } from 'react';
import { calcVO2Max } from '@/lib/calc';
import { Shell, NumIn, Toggle, Stat, Box, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

const ACTIVITY_LABELS = [
  'Sedentary, no exercise', 'Light, occasional activity', 'Light, regular activity',
  'Moderate, 1-2x/week', 'Moderate, 3-4x/week', 'Active, 5+ x/week',
  'Very active, intense training', 'Elite athlete level',
];

export default function VO2MaxCalc() {
  const [age, setAge] = useState(30);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [female, setFemale] = useState(false);
  const [activity, setActivity] = useState(4);
  const r = calcVO2Max(age, weight, height, female ? 'female' : 'male', activity);

  useEffect(() => {
    saveHistory({
      calcSlug: 'vo2max', calcName: 'VO2 Max Estimator',
      summary: `VO2 max ${r.vo2max} mL/kg/min — ${r.category}`,
      inputs: { age, weight, height, activity },
    });
  }, [age, weight, height, female, activity]);

  return (
    <Shell
      left={<>
        <NumIn label="Age" value={age} onChange={setAge} min={10} max={90}/>
        <div className="grid grid-cols-2 gap-3">
          <NumIn label="Weight (kg)" value={weight} onChange={setWeight} min={20} max={300} step={0.5}/>
          <NumIn label="Height (cm)" value={height} onChange={setHeight} min={50} max={250}/>
        </div>
        <div>
          <label className="calc-label">Sex</label>
          <Toggle v={female} a="Female" b="Male" onA={()=>setFemale(true)} onB={()=>setFemale(false)}/>
        </div>
        <div>
          <label className="calc-label">Activity level: {ACTIVITY_LABELS[activity]}</label>
          <input type="range" min={0} max={7} step={1} value={activity}
            onChange={e=>setActivity(+e.target.value)}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-teal-500"/>
        </div>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-teal-600 dark:text-teal-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Estimated VO2 Max
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800">
            <p className="result-label text-teal-600 dark:text-teal-400">VO2 Max</p>
            <p className="calc-num-lg text-teal-600 dark:text-teal-400">{r.vo2max}</p>
            <p className="text-xs text-gray-400 mt-1">mL/kg/min</p>
          </div>
          <Stat label="Fitness category" value={r.category} color={TC.teal}/>
        </div>
        <Box icon="💡 Non-exercise estimate" color="teal"
          text="This uses the Jackson et al. non-exercise regression model (age, BMI, sex, self-reported activity) — a validated way to estimate aerobic fitness without a treadmill or lab test. It's an estimate, not a substitute for an actual graded exercise test if you need a precise number."/>
      </>}
    />
  );
}
