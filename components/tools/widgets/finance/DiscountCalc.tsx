'use client';
import { useState, useEffect } from 'react';
import { calcDiscount } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function DiscountCalc() {
  const [curr, setCurr] = useState('INR');
  const [price, setPrice] = useState(2000);
  const [discount1, setDiscount1] = useState(20);
  const [discount2, setDiscount2] = useState(0);
  const C = useCurr(curr);
  const r = calcDiscount(price, discount1, discount2);

  useEffect(() => {
    saveHistory({
      calcSlug: 'discount', calcName: 'Discount Calculator',
      summary: `${C.sym}${fmtFull(price,0)} → ${C.sym}${fmtFull(r.finalPrice,0)} (saved ${C.sym}${fmtFull(r.totalSaved,0)})`,
      inputs: { price, discount1, discount2 },
    });
  }, [price, discount1, discount2]);

  return (
    <Shell
      left={<>
        <CurrPills val={curr} onChange={setCurr}/>
        <MoneyIn label="Original price" value={price} onChange={setPrice} sym={C.sym} step={100}/>
        <PctIn label="Discount %" value={discount1} onChange={setDiscount1} step={5}/>
        <PctIn label="Additional discount % (optional, stacked)" value={discount2} onChange={setDiscount2} step={5}
          hint="e.g. an extra 10% off at checkout, applied after the first discount"/>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Final price after discount
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card col-span-2 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <p className="result-label text-green-600 dark:text-green-400">You pay</p>
            <p className="calc-num-lg text-green-600 dark:text-green-400">{C.sym}{fmtFull(r.finalPrice, 2)}</p>
          </div>
          <Stat label="Total saved" value={`${C.sym}${fmtFull(r.totalSaved,2)}`} color={TC.orange}/>
          <Stat label="Effective discount" value={`${r.effectivePct}%`} color={TC.gray}/>
        </div>
        {discount2 > 0 && (
          <Box icon="💡 Stacked discounts aren't additive" color="orange"
            text={`20% + 10% off does not equal 30% off — discounts compound on the already-reduced price. ${discount1}% then ${discount2}% works out to ${r.effectivePct}% total, not ${discount1+discount2}%.`}/>
        )}
      </>}
    />
  );
}
