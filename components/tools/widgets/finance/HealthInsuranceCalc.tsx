'use client';
import { useState, useEffect } from 'react';
import { calcHealthInsurance } from '@/lib/calc';
import { Shell, NumIn, SelectIn, Toggle, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function HealthInsuranceCalc() {
  const [familySize, setFamilySize] = useState(4);
  const [cityTier, setCityTier] = useState<'metro'|'tier2'|'tier3'>('metro');
  const [oldestAge, setOldestAge] = useState(40);
  const [hasConditions, setHasConditions] = useState(false);
  const C = useCurr('INR');
  const r = calcHealthInsurance(familySize, cityTier, oldestAge, hasConditions);

  useEffect(() => {
    saveHistory({
      calcSlug: 'health-insurance', calcName: 'Health Insurance Calculator',
      summary: `Recommended cover: ${C.sym}${fmtFull(r.recommendedCover,0)}`,
      inputs: { familySize, oldestAge, hasConditions: hasConditions ? 1 : 0 },
    });
  }, [familySize, cityTier, oldestAge, hasConditions]);

  return (
    <Shell
      left={<>
        <NumIn label="Family members to cover" value={familySize} onChange={setFamilySize} min={1} max={8}/>
        <SelectIn label="City tier" value={cityTier} onChange={v=>setCityTier(v as any)}
          options={[{value:'metro',label:'Metro (higher healthcare cost)'},{value:'tier2',label:'Tier 2 city'},{value:'tier3',label:'Tier 3 / town'}]}/>
        <NumIn label="Age of oldest family member" value={oldestAge} onChange={setOldestAge} min={1} max={90}/>
        <div>
          <label className="calc-label">Any pre-existing conditions?</label>
          <Toggle v={hasConditions} a="Yes" b="No" onA={()=>setHasConditions(true)} onB={()=>setHasConditions(false)}/>
        </div>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Recommended family floater cover
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <p className="result-label text-orange-600 dark:text-orange-400">Recommended sum insured</p>
            <p className="calc-num-lg text-orange-500 dark:text-orange-400">{C.sym}{fmtFull(r.recommendedCover, 0)}</p>
          </div>
          <Stat label="Est. annual premium (low)" value={`${C.sym}${fmtFull(r.estimatedAnnualPremiumLow,0)}`} color={TC.gray}/>
          <Stat label="Est. annual premium (high)" value={`${C.sym}${fmtFull(r.estimatedAnnualPremiumHigh,0)}`} color={TC.gray}/>
        </div>
        <Box icon="⚠️ Heuristic estimate, not a quote" color="orange"
          text="A single hospitalisation without adequate insurance can wipe out years of savings. This is a rough sizing guide based on city tier, age, and family size — get actual quotes from insurers, as premiums vary significantly by insurer, room-rent limits, and specific health history."/>
      </>}
    />
  );
}
