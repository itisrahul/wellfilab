'use client';
import { useState } from 'react';
import { calcFIRE } from '@/lib/calc';
import { Shell, CurrPills, MoneyIn, PctIn, Stat, Box, useCurr, fmtFull, TC } from '@/components/tools/shared';
export default function FIRECalc() {
  const [curr,setCurr]=useState('INR'),[annExp,setAnnExp]=useState(600000),[port,setPort]=useState(500000),[monthly,setMonthly]=useState(20000),[roi,setRoi]=useState(12);
  const C=useCurr(curr); const r=calcFIRE(annExp,port,monthly,roi);
  const fireStr = C.sym+fmtFull(r.fireNum,2);
  const deficitStr = C.sym+fmtFull(r.deficit,2);
  const leanStr = C.sym+fmtFull(r.leanFire,2);
  const fatStr = C.sym+fmtFull(r.fatFire,2);
  const mthStr = C.sym+fmtFull(Math.round(annExp/12),2);
  return (
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <MoneyIn label="Annual living expenses" value={annExp} onChange={setAnnExp} sym={C.sym} step={10000} hint={C.sym+fmtFull(Math.round(annExp/12),2)+'/month'}/>
      <MoneyIn label="Current portfolio" value={port} onChange={setPort} sym={C.sym} step={50000}/>
      <MoneyIn label="Monthly investment" value={monthly} onChange={setMonthly} sym={C.sym} step={1000}/>
      <PctIn label="Expected annual return" value={roi} onChange={setRoi} step={0.5}/>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">FIRE — Financial Independence</h3>
      <p className="text-sm text-gray-500">FIRE number = 25 × annual expenses. At 4% withdrawal, portfolio lasts indefinitely.</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="result-card col-span-2 md:col-span-1 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <p className="result-label text-orange-600">Your FIRE number</p>
          <p className="calc-num-lg text-orange-500">{fireStr}</p>
        </div>
        <Stat label="Years to FIRE" value={`${r.years}y ${r.remMonths}m`} color={TC.teal}/>
        <Stat label="Gap to close" value={deficitStr} color={TC.red}/>
        <Stat label="Lean FIRE (70% lifestyle)" value={leanStr} color={TC.gray}/>
        <Stat label="Fat FIRE (150% lifestyle)" value={fatStr} color={TC.gray}/>
        <Stat label="Monthly at FIRE (4% rule)" value={mthStr} color={TC.green}/>
      </div>
      <Box icon="🔥 What is FIRE?" text={"Financial Independence means investments generate enough returns to cover living costs forever — so work becomes optional. Your number is "+fireStr+"."}/>
    </>}/>
  );
}
