'use client';
import { useState, useEffect } from 'react';
import { calcCarInsurance } from '@/lib/calc';
import { Shell, MoneyIn, NumIn, PctIn, SelectIn, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function CarInsuranceCalc() {
  const [carValue, setCarValue] = useState(800000);
  const [carAge, setCarAge] = useState(2);
  const [cityTier, setCityTier] = useState<'metro'|'tier2'|'tier3'>('metro');
  const [ncb, setNcb] = useState(20);
  const C = useCurr('INR');
  const r = calcCarInsurance(carValue, carAge, cityTier, ncb);

  useEffect(() => {
    saveHistory({
      calcSlug: 'car-insurance', calcName: 'Car Insurance Calculator',
      summary: `Est. premium ${C.sym}${fmtFull(r.netPremium,0)}/yr (IDV ${C.sym}${fmtFull(r.idv,0)})`,
      inputs: { carValue, carAge, ncb },
    });
  }, [carValue, carAge, cityTier, ncb]);

  return (
    <Shell
      left={<>
        <MoneyIn label="Current market value of car" value={carValue} onChange={setCarValue} sym={C.sym} step={50000}/>
        <NumIn label="Car age (years)" value={carAge} onChange={setCarAge} min={0} max={15}/>
        <SelectIn label="City tier" value={cityTier} onChange={v=>setCityTier(v as any)}
          options={[{value:'metro',label:'Metro'},{value:'tier2',label:'Tier 2 city'},{value:'tier3',label:'Tier 3 / town'}]}/>
        <PctIn label="No-Claim Bonus (NCB) %" value={ncb} onChange={setNcb} step={5}
          hint="Increases 5% each claim-free year, up to 50% max"/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Estimated annual premium
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <p className="result-label text-orange-600 dark:text-orange-400">Estimated net premium</p>
            <p className="calc-num-lg text-orange-500 dark:text-orange-400">{C.sym}{fmtFull(r.netPremium, 0)}</p>
          </div>
          <Stat label="Insured Declared Value (IDV)" value={`${C.sym}${fmtFull(r.idv,0)}`} color={TC.gray}/>
          <Stat label="NCB discount applied" value={`${C.sym}${fmtFull(r.ncbDiscount,0)}`} color={TC.green}/>
          <Stat label="Own-damage premium" value={`${C.sym}${fmtFull(r.odPremium,0)}`} color={TC.gray}/>
          <Stat label="Third-party premium" value={`${C.sym}${fmtFull(r.tpPremium,0)}`} color={TC.gray}/>
        </div>
        <Box icon="⚠️ Indicative estimate" color="orange"
          text="Actual premiums vary by insurer, engine cubic capacity, add-on covers (zero depreciation, engine protection), and your specific IDV negotiated with the insurer. This estimate uses simplified IRDAI-style depreciation bands — get a real quote for an exact figure."/>
      </>}
    />
  );
}
