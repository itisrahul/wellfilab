'use client';
import { useState, useEffect } from 'react';
import { calcStockAverage } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, NumIn, Stat, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

interface Purchase { shares: number; price: number; }
const DEFAULT_PURCHASES: Purchase[] = [{ shares: 100, price: 250 }, { shares: 50, price: 180 }];

export default function StockAverageCalc() {
  const [curr, setCurr] = useState('INR');
  const [purchases, setPurchases] = useState<Purchase[]>(DEFAULT_PURCHASES);
  const [marketPrice, setMarketPrice] = useState(220);
  const C = useCurr(curr);

  const r = calcStockAverage(purchases);
  const currentValue = r.totalShares * marketPrice;
  const pnl = currentValue - r.totalCost;
  const pnlPct = r.totalCost > 0 ? (pnl / r.totalCost) * 100 : 0;

  const setPurchase = (i: number, key: keyof Purchase, v: number) => setPurchases(p => p.map((x, idx) => idx === i ? { ...x, [key]: v } : x));
  const addRow = () => purchases.length < 10 && setPurchases(p => [...p, { shares: 10, price: marketPrice }]);
  const removeRow = (i: number) => purchases.length > 1 && setPurchases(p => p.filter((_, idx) => idx !== i));

  useEffect(() => {
    saveHistory({
      calcSlug: 'stock-average', calcName: 'Stock Average Calculator',
      summary: `Avg price ${C.sym}${fmtFull(r.avgPrice,2)} across ${r.totalShares} shares`,
      inputs: { purchases: JSON.stringify(purchases), marketPrice },
    });
  }, [purchases, marketPrice]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <div>
        <label className="calc-label">Purchases</label>
        <div className="space-y-2">
          {purchases.map((p, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1"><NumIn label={i===0?'Shares':''} value={p.shares} onChange={v => setPurchase(i, 'shares', v)} min={0}/></div>
              <div className="flex-1"><MoneyIn label={i===0?'Price/share':''} value={p.price} onChange={v => setPurchase(i, 'price', v)} sym={C.sym} step={1}/></div>
              {purchases.length > 1 && (
                <button onClick={() => removeRow(i)} className="text-gray-400 hover:text-red-500 flex-shrink-0 px-2 pb-2.5" title="Remove">✕</button>
              )}
            </div>
          ))}
        </div>
        {purchases.length < 10 && (
          <button onClick={addRow} className="mt-2 text-xs font-bold text-orange-500 hover:text-orange-600">+ Add purchase</button>
        )}
      </div>
      <MoneyIn label="Current market price" value={marketPrice} onChange={setMarketPrice} sym={C.sym} step={1}/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Average Cost Basis</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <p className="result-label text-orange-600 mb-0">Average buy price</p>
          <p className="calc-num-lg text-orange-500">{C.sym}{fmtFull(r.avgPrice,2)}</p>
        </div>
        <Stat label="Total shares" value={String(r.totalShares)} color={TC.gray}/>
        <Stat label="Total invested" value={`${C.sym}${fmtFull(r.totalCost,2)}`} color={TC.gray}/>
        <Stat label="Current value" value={`${C.sym}${fmtFull(currentValue,2)}`} color={TC.blue}/>
        <Stat label="Break-even price" value={`${C.sym}${fmtFull(r.breakEvenPrice,2)}`} color={TC.teal}/>
        <div className="result-card col-span-2" style={{}}>
          <p className="result-label mb-0">Unrealized P&amp;L</p>
          <p className={`calc-num-lg ${pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>{pnl >= 0 ? '+' : ''}{C.sym}{fmtFull(pnl,2)} ({pnl >= 0 ? '+' : ''}{fmtFull(pnlPct)}%)</p>
        </div>
      </div>
    </>}/>
  );
}
