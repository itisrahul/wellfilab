'use client';
import { useState, useEffect } from 'react';
import { calcPregnancyWeightGain } from '@/lib/calc';
import { Shell, NumIn, Stat, Box, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function PregnancyWeightGainCalc() {
  const [bmi, setBmi] = useState(22);
  const [weeks, setWeeks] = useState(20);
  const r = calcPregnancyWeightGain(bmi, weeks);

  useEffect(() => {
    saveHistory({
      calcSlug: 'pregnancy-weight-gain', calcName: 'Pregnancy Weight Gain Calculator',
      summary: `Week ${weeks}: ${r.projectedLow}-${r.projectedHigh}kg expected gain so far`,
      inputs: { bmi, weeks },
    });
  }, [bmi, weeks]);

  return (
    <Shell
      left={<>
        <NumIn label="Pre-pregnancy BMI" value={bmi} onChange={setBmi} min={14} max={50} step={0.1}
          hint="Use the BMI Calculator first if you don't know this"/>
        <NumIn label="Weeks of pregnancy (gestation)" value={weeks} onChange={setWeeks} min={1} max={42}/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-teal-600 dark:text-teal-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Expected weight gain by week {weeks}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card col-span-2 bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800">
            <p className="result-label text-teal-600 dark:text-teal-400">Projected gain so far</p>
            <p className="calc-num-lg text-teal-600 dark:text-teal-400">{r.projectedLow}–{r.projectedHigh} kg</p>
          </div>
          <Stat label="Total recommended (full term)" value={`${r.totalRangeLow}–${r.totalRangeHigh} kg`} color={TC.gray}/>
        </div>
        <Box icon="💡 IOM guidelines" color="teal"
          text="These ranges follow Institute of Medicine guidelines, which scale recommended total pregnancy weight gain by your pre-pregnancy BMI category — underweight individuals are guided toward more gain, and those with a higher starting BMI toward less. Always discuss your specific situation with your doctor."/>
      </>}
    />
  );
}
