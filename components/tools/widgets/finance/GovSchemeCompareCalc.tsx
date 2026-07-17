'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { calcGovSchemeCompare } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, NumIn, Box, useCurr, fmtFull, fmtSmart, TC, Stat } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

const TAX_SLABS = [10, 20, 30];

export default function GovSchemeCompareCalc() {
  const [curr, setCurr] = useState('INR');
  const [monthly, setMonthly] = useState(5000);
  const [years, setYears] = useState(15);
  const [age, setAge] = useState(30);
  const [taxSlab, setTaxSlab] = useState(20);
  const C = useCurr(curr);
  const r = calcGovSchemeCompare(monthly, years, taxSlab);

  const schemes = [
    { key: 'ppf', label: 'PPF', icon: '🏦', maturity: r.ppf.maturity, rate: r.ppf.rate, taxFree: true, lockIn: '15 years' },
    { key: 'epf', label: 'EPF', icon: '👔', maturity: r.epf.maturity, rate: r.epf.rate, taxFree: true, lockIn: 'Till retirement' },
    { key: 'nps', label: 'NPS', icon: '📊', maturity: r.nps.maturity, rate: r.nps.rate, taxFree: false, lockIn: 'Age 60 (40% must annuitize)' },
    { key: 'fd', label: 'FD', icon: '🏛️', maturity: r.fd.postTax, rate: r.fd.rate, taxFree: false, lockIn: 'Flexible' },
  ];
  const best = schemes.reduce((b, s) => s.maturity > b.maturity ? s : b, schemes[0]);
  const chartData = schemes.map(s => ({ name: s.label, value: s.maturity }));

  useEffect(() => {
    saveHistory({
      calcSlug: 'gov-scheme-compare', calcName: 'PPF vs EPF vs NPS vs FD',
      summary: `₹${monthly}/mo for ${years}yr — best: ${best.label} at ${C.sym}${fmtFull(best.maturity,0)}`,
      inputs: { monthly, years, age, taxSlab },
    });
  }, [monthly, years, age, taxSlab]);

  const recommendation = (() => {
    if (age >= 50) return 'At your age, prioritise PPF and EPF for capital safety and guaranteed tax-free returns — you have less time to recover from NPS market volatility before needing the money.';
    if (taxSlab === 30) return "You're in the highest tax bracket — PPF and EPF's tax-free status is worth the most to you. NPS adds extra 80CCD(1B) deduction room (₹50,000) beyond the ₹1.5L Section 80C limit, worth using fully.";
    if (years >= 20) return 'With a long horizon, NPS\'s market-linked equity exposure has the most room to compound — consider splitting between NPS (growth) and PPF (safety) rather than picking just one.';
    return 'A mix works best for most people: PPF/EPF for the guaranteed, tax-free core of your portfolio, NPS for extra 80CCD(1B) tax savings, and equity mutual funds (not shown here) for growth beyond what these safer schemes offer.';
  })();

  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Monthly investment" value={monthly} onChange={setMonthly} sym={C.sym} step={500}/>
      <NumIn label="Years" value={years} onChange={setYears} min={1} max={40}/>
      <NumIn label="Current age" value={age} onChange={setAge} min={18} max={65}/>
      <div>
        <label className="calc-label">Your income tax slab</label>
        <div className="flex flex-wrap gap-1.5">
          {TAX_SLABS.map(v=><button key={v} onClick={()=>setTaxSlab(v)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${taxSlab===v?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'}`}>{v}%</button>)}
        </div>
      </div>
      <Box icon="💡 Section 80C" text="PPF, EPF and NPS contributions (up to ₹1.5L combined) qualify for Section 80C tax deduction. NPS gets an extra ₹50,000 under Section 80CCD(1B), on top of the 80C limit — worth up to ₹15,600/year in tax savings at the 30% slab."/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">PPF vs EPF vs NPS vs FD</h3>

      <div className="grid grid-cols-2 gap-3">
        {schemes.map(s => (
          <div key={s.key} className={`result-card text-center ${s.key === best.key ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700' : ''}`}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1 flex items-center justify-center gap-1">{s.icon} {s.label} {s.key === best.key && '🏆'}</p>
            <p className={`calc-num-md ${s.key === best.key ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>{fmtSmart(s.maturity, C.sym)}</p>
            <p className="text-[10px] text-gray-400 mt-1">{s.rate}% · {s.taxFree ? 'tax-free' : s.key === 'fd' ? 'post-tax' : '60% tax-free'}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-gray-400 uppercase tracking-wide">
              <th className="pb-2 font-bold">Scheme</th><th className="pb-2 font-bold">Rate</th><th className="pb-2 font-bold">Maturity</th><th className="pb-2 font-bold">Tax-free</th><th className="pb-2 font-bold">Lock-in</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {schemes.map(s => (
              <tr key={s.key} className={s.key === best.key ? 'bg-green-50 dark:bg-green-950/20' : ''}>
                <td className="py-2.5 font-semibold text-gray-700 dark:text-gray-300">{s.icon} {s.label}</td>
                <td className="py-2.5 text-gray-500 dark:text-gray-400">{s.rate}%</td>
                <td className={`py-2.5 font-bold ${s.key === best.key ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>{C.sym}{fmtFull(s.maturity,0)}</td>
                <td className="py-2.5">{s.taxFree ? '✅ Yes' : s.key === 'nps' ? '⚠️ 60%' : '❌ No'}</td>
                <td className="py-2.5 text-gray-500 dark:text-gray-400">{s.lockIn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {r.ppf.capped && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400">⚠️ PPF caps contributions at ₹12,500/month (₹1.5L/year) — the extra {C.sym}{fmtFull((monthly-12500),0)}/month shown for PPF above isn't actually invested there.</p>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Maturity value comparison</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{top:5,right:5,bottom:5,left:5}}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="name" tick={{fontSize:11}}/>
            <YAxis tickFormatter={v=>fmtSmart(v,C.sym)} tick={{fontSize:10}} width={70}/>
            <Tooltip formatter={(v:number)=>[`${C.sym}${fmtFull(v,0)}`,'Maturity']}/>
            <Bar dataKey="value" radius={[6,6,0,0]}>
              {chartData.map((d,i)=><Cell key={i} fill={schemes[i].key===best.key ? '#10b981' : '#94a3b8'}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Stat label="EPF assumes employer matches your contribution" value={`${C.sym}${fmtFull(monthly,0)} you + ${C.sym}${fmtFull(monthly,0)} employer`} color={TC.gray}/>

      <Box icon="🎯 For your situation" text={`Age ${age}, ${taxSlab}% tax bracket, ${years}-year horizon: ${recommendation}`} color="teal"/>
    </>}/>
  );
}
