'use client';
import { useState, useEffect } from 'react';
import { calcCapitalGains } from '@/lib/calc';
import { Shell, MoneyIn, NumIn, SelectIn, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function CapitalGainsCalc() {
  const [purchasePrice, setPurchasePrice] = useState(100000);
  const [salePrice, setSalePrice] = useState(180000);
  const [holdingMonths, setHoldingMonths] = useState(18);
  const [assetType, setAssetType] = useState<'equity'|'debt'|'property'>('equity');
  const C = useCurr('INR');
  const r = calcCapitalGains(purchasePrice, salePrice, holdingMonths, assetType);

  useEffect(() => {
    saveHistory({
      calcSlug: 'capital-gains', calcName: 'Capital Gains Tax Calculator',
      summary: `${assetType} gain ${C.sym}${fmtFull(r.gain,0)} — tax ${C.sym}${fmtFull(r.tax,0)}`,
      inputs: { purchasePrice, salePrice, holdingMonths },
    });
  }, [purchasePrice, salePrice, holdingMonths, assetType]);

  return (
    <Shell
      left={<>
        <SelectIn label="Asset type" value={assetType} onChange={v=>setAssetType(v as any)}
          options={[{value:'equity',label:'Equity / Mutual Funds'},{value:'debt',label:'Debt Funds'},{value:'property',label:'Property'}]}/>
        <MoneyIn label="Purchase price" value={purchasePrice} onChange={setPurchasePrice} sym={C.sym} step={10000}/>
        <MoneyIn label="Sale price" value={salePrice} onChange={setSalePrice} sym={C.sym} step={10000}/>
        <NumIn label="Holding period (months)" value={holdingMonths} onChange={setHoldingMonths} min={1} max={360}/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          {r.isLongTerm ? 'Long-term' : 'Short-term'} capital gains
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Total gain" value={`${C.sym}${fmtFull(r.gain,0)}`} color={TC.green}/>
          <Stat label="Tax rate applied" value={`${r.taxRate}%`} color={TC.gray}/>
          {r.exemption > 0 && <Stat label="Exemption applied" value={`${C.sym}${fmtFull(r.exemption,0)}`} color={TC.teal}/>}
          <Stat label="Taxable gain" value={`${C.sym}${fmtFull(r.taxableGain,0)}`} color={TC.orange}/>
          <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <p className="result-label text-orange-600 dark:text-orange-400">Estimated tax payable</p>
            <p className="calc-num-lg text-orange-500 dark:text-orange-400">{C.sym}{fmtFull(r.tax, 0)}</p>
          </div>
          <Stat label="Net gain after tax" value={`${C.sym}${fmtFull(r.netGain,0)}`} color={TC.green}/>
        </div>
        <Box icon="⚠️ Simplified estimate" color="orange"
          text="Equity LTCG (held over 12 months) is taxed at 12.5% above a ₹1.25 lakh annual exemption; STCG at 20%. Debt fund and property rules are more nuanced (indexation, slab-rate interactions) than this simplified model captures — confirm with a tax professional for an actual filing."/>
      </>}
    />
  );
}
