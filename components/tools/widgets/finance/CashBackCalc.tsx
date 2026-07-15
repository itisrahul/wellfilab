'use client';
import { useState, useEffect } from 'react';
import { calcCashBack } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, Field, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

const CATEGORIES = ['groceries', 'dining', 'fuel', 'travel', 'online', 'other'] as const;
const CATEGORY_LABEL: Record<typeof CATEGORIES[number], string> = {
  groceries: 'Groceries', dining: 'Dining', fuel: 'Fuel', travel: 'Travel', online: 'Online', other: 'Other',
};
const DEFAULT_SPEND: Record<string, number> = { groceries: 10000, dining: 5000, fuel: 3000, travel: 5000, online: 8000, other: 9000 };

interface Card { name: string; fee: number; rates: Record<string, number>; }
const DEFAULT_CARDS: Card[] = [
  { name: 'Card 1', fee: 500, rates: { groceries: 5, dining: 5, fuel: 1, travel: 1, online: 2, other: 1 } },
  { name: 'Card 2', fee: 0,   rates: { groceries: 1, dining: 1, fuel: 1, travel: 1, online: 1, other: 1 } },
  { name: 'Card 3', fee: 1500, rates: { groceries: 2, dining: 2, fuel: 5, travel: 5, online: 2, other: 1 } },
];

export default function CashBackCalc() {
  const [curr, setCurr] = useState('INR');
  const [spend, setSpend] = useState<Record<string, number>>(DEFAULT_SPEND);
  const [cards, setCards] = useState<Card[]>(DEFAULT_CARDS);
  const C = useCurr(curr);

  const results = cards.map(card => ({ ...card, ...calcCashBack(spend, card.rates, card.fee) }));
  const bestIdx = results.reduce((best, r, i) => r.netAnnual > results[best].netAnnual ? i : best, 0);

  const setSpendCat = (cat: string, v: number) => setSpend(s => ({ ...s, [cat]: v }));
  const setCardField = (i: number, key: 'name' | 'fee', v: string | number) => setCards(c => c.map((x, idx) => idx === i ? { ...x, [key]: v } : x));
  const setCardRate = (i: number, cat: string, v: number) => setCards(c => c.map((x, idx) => idx === i ? { ...x, rates: { ...x.rates, [cat]: v } } : x));

  useEffect(() => {
    saveHistory({
      calcSlug: 'cash-back', calcName: 'Cash Back Calculator',
      summary: `Best card: ${results[bestIdx]?.name} — ${C.sym}${fmtFull(results[bestIdx]?.netAnnual ?? 0,0)}/yr net`,
      inputs: { spend: JSON.stringify(spend), cards: JSON.stringify(cards.map(c => c.name)) },
    });
  }, [spend, cards]);

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <div>
        <label className="calc-label">Monthly spend by category</label>
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <MoneyIn key={cat} label={CATEGORY_LABEL[cat]} value={spend[cat]} onChange={v => setSpendCat(cat, v)} sym={C.sym} step={500}/>
          ))}
        </div>
      </div>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Compare Cashback Cards</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {cards.map((card, i) => (
          <div key={i} className={`rounded-xl border-2 p-3 ${bestIdx===i?'border-teal-500 bg-teal-50 dark:bg-teal-950/20':'border-gray-200 dark:border-gray-700'}`}>
            <Field value={card.name} onChange={e => setCardField(i, 'name', e.target.value)} className="!px-2 !py-1.5 font-bold text-sm mb-2 border rounded"/>
            <MoneyIn label="Annual fee" value={card.fee} onChange={v => setCardField(i, 'fee', v)} sym={C.sym} step={100}/>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {CATEGORIES.map(cat => (
                <PctIn key={cat} label={CATEGORY_LABEL[cat]} value={card.rates[cat]} onChange={v => setCardRate(i, cat, v)} step={0.5}/>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full breakdown-table">
          <thead><tr><th className="bg-gray-700">Card</th>{results.map((r,i) => <th key={i} className={bestIdx===i ? 'bg-teal-600' : 'bg-orange-500'}>{r.name}{bestIdx===i ? ' 🏆' : ''}</th>)}</tr></thead>
          <tbody>
            <tr><td className="calc-num-sm text-gray-700 dark:text-gray-300">Gross annual</td>{results.map((r,i) => <td key={i} className="calc-num-sm text-right text-gray-800 dark:text-gray-100">{C.sym}{fmtFull(r.grossAnnual,0)}</td>)}</tr>
            <tr><td className="calc-num-sm text-gray-700 dark:text-gray-300">Annual fee</td>{results.map((r,i) => <td key={i} className="calc-num-sm text-right text-red-500">-{C.sym}{fmtFull(r.fee,0)}</td>)}</tr>
            <tr className="font-bold bg-orange-50 dark:bg-orange-950/20"><td className="calc-num-sm text-gray-700 dark:text-gray-300">Net cashback</td>{results.map((r,i) => <td key={i} className={`calc-num-sm text-right ${bestIdx===i?'text-teal-600 dark:text-teal-400':'text-gray-800 dark:text-gray-100'}`}>{C.sym}{fmtFull(r.netAnnual,0)}</td>)}</tr>
          </tbody>
        </table>
      </div>
    </>}/>
  );
}
