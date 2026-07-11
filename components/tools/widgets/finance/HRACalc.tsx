'use client';
import { useState, useEffect } from 'react';
import { calcHRA } from '@/lib/calc';
import { Shell, MoneyIn, Toggle, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

export default function HRACalc() {
  const [basic, setBasic] = useState(360000);
  const [hraReceived, setHraReceived] = useState(180000);
  const [rentPaid, setRentPaid] = useState(240000);
  const [isMetro, setIsMetro] = useState(true);
  const C = useCurr('INR');
  const r = calcHRA(basic, hraReceived, rentPaid, isMetro);

  useEffect(() => {
    saveHistory({
      calcSlug: 'hra', calcName: 'HRA Exemption Calculator',
      summary: `Exemption ${C.sym}${fmtFull(r.exemption,0)} of ${C.sym}${fmtFull(hraReceived,0)} HRA`,
      inputs: { basic, hraReceived, rentPaid, isMetro: isMetro ? 1 : 0 },
    });
  }, [basic, hraReceived, rentPaid, isMetro]);

  return (
    <Shell
      left={<>
        <MoneyIn label="Annual basic salary" value={basic} onChange={setBasic} sym={C.sym} step={10000}/>
        <MoneyIn label="Annual HRA received" value={hraReceived} onChange={setHraReceived} sym={C.sym} step={10000}/>
        <MoneyIn label="Annual rent paid" value={rentPaid} onChange={setRentPaid} sym={C.sym} step={10000}/>
        <div>
          <label className="calc-label">City type</label>
          <Toggle v={isMetro} a="Metro" b="Non-metro" onA={()=>setIsMetro(true)} onB={()=>setIsMetro(false)}/>
          <p className="text-xs text-gray-400 mt-1">Metro: Delhi, Mumbai, Kolkata, Chennai</p>
        </div>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          HRA exemption under Section 10(13A)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card col-span-2 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <p className="result-label text-green-600 dark:text-green-400">Exempt from tax</p>
            <p className="calc-num-lg text-green-600 dark:text-green-400">{C.sym}{fmtFull(r.exemption, 0)}</p>
          </div>
          <Stat label="Taxable HRA" value={`${C.sym}${fmtFull(r.taxable,0)}`} color={TC.orange}/>
          <Stat label="" value="" color={TC.gray}/>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-orange-500 px-4 py-2">
            <p className="text-xs font-bold text-white">Least of these three (the exemption rule)</p>
          </div>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">1. Actual HRA received</td>
                <td className="px-3 py-2 font-mono text-right">{C.sym}{fmtFull(r.condition1,0)}</td>
              </tr>
              <tr className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">2. Rent paid − 10% of basic</td>
                <td className="px-3 py-2 font-mono text-right">{C.sym}{fmtFull(r.condition2,0)}</td>
              </tr>
              <tr className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">3. {isMetro?'50%':'40%'} of basic salary</td>
                <td className="px-3 py-2 font-mono text-right">{C.sym}{fmtFull(r.condition3,0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Box icon="💡 This is an estimate" color="orange"
          text="This calculator applies the standard three-condition rule under Section 10(13A) using annual figures. Confirm with your employer's payroll or a tax professional for your exact Form 16 computation."/>
      </>}
    />
  );
}
