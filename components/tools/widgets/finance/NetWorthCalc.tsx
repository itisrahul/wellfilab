'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calcNetWorth } from '@/lib/calc';
import { Shell, CurrPills, useCurr, fmtFull, fmtSmart } from '@/components/tools/shared';
import { getSnapshots, addSnapshot, deleteSnapshot, clearSnapshots, type NetWorthSnapshot } from '@/lib/netWorthHistory';
import { getLatestScore } from '@/lib/scoreStorage';
import type { WellFiScore } from '@/lib/wellfilab-score';

const MILESTONES = [100000, 500000, 1000000, 2500000, 5000000, 10000000, 25000000, 50000000, 100000000];

export default function NetWorthCalc() {
  const [curr,setCurr]=useState('INR');
  const [assets,setAssets]=useState([{label:'Cash & Savings',value:150000},{label:'Investments',value:300000},{label:'Property',value:2500000},{label:'Pension / Retirement',value:400000}]);
  const [liabs,setLiabs]=useState([{label:'Home Loan',value:1800000},{label:'Car Loan',value:120000},{label:'Credit Card',value:30000}]);
  const [history, setHistory] = useState<NetWorthSnapshot[]>([]);
  const [saved, setSaved] = useState(false);
  const [score, setScore] = useState<WellFiScore | null>(null);
  const C=useCurr(curr); const r=calcNetWorth(assets,liabs);
  const ua=(i:number,f:string,v:string|number)=>{const a=[...assets];(a[i] as Record<string,string|number>)[f]=v;setAssets(a);};
  const ul=(i:number,f:string,v:string|number)=>{const l=[...liabs];(l[i] as Record<string,string|number>)[f]=v;setLiabs(l);};

  useEffect(() => { getSnapshots().then(setHistory); getLatestScore().then(setScore); }, []);

  const nextMilestone = MILESTONES.find(m => m > r.netWorth) ?? null;
  const prevMilestone = [...MILESTONES].reverse().find(m => m <= r.netWorth) ?? 0;
  const milestonePct = nextMilestone ? Math.max(0, Math.min(100, ((r.netWorth - prevMilestone) / (nextMilestone - prevMilestone)) * 100)) : 100;

  const currentTrajectory = score?.trajectories?.find(t => t.scenario === 'current');
  const fireProgress = currentTrajectory && currentTrajectory.netWorthAt60 > 0
    ? Math.min(100, Math.round((r.netWorth / currentTrajectory.netWorthAt60) * 100))
    : null;

  const saveSnapshot = async () => {
    await addSnapshot(r.totalAssets, r.totalLiab);
    setHistory(await getSnapshots());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const removeSnapshot = async (id: string) => { await deleteSnapshot(id); setHistory(await getSnapshots()); };
  const clearAll = async () => { if (confirm('Clear all saved net worth history?')) { await clearSnapshots(); setHistory([]); } };

  const chartData = history.map(s => ({ month: new Date(s.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), value: s.netWorth }));
  const lastTwo = history.slice(-2);
  const change = lastTwo.length === 2 ? lastTwo[1].netWorth - lastTwo[0].netWorth : null;

  return (
    <>
    <Shell left={<>
      <CurrPills val={curr} onChange={setCurr}/>
      <p className="calc-label">Assets (what you own)</p>
      {assets.map((a,i)=><div key={i} className="flex gap-2"><input type="text" value={a.label} onChange={e=>ua(i,'label',e.target.value)} className="flex-1 text-xs border-2 border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-orange-500"/><input type="number" value={a.value} onChange={e=>ua(i,'value',+e.target.value)} className="w-24 text-xs border-2 border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 focus:outline-none focus:border-orange-500" style={{fontFamily:"var(--font-mono,monospace)"}}/><button onClick={()=>setAssets(assets.filter((_,j)=>j!==i))} className="text-red-400 hover:text-red-600 text-xs">✕</button></div>)}
      <button onClick={()=>setAssets([...assets,{label:'New Asset',value:0}])} className="text-xs text-orange-500 font-semibold hover:underline">+ Add asset</button>
      <p className="calc-label pt-2 border-t border-gray-200 dark:border-gray-700">Liabilities (what you owe)</p>
      {liabs.map((l,i)=><div key={i} className="flex gap-2"><input type="text" value={l.label} onChange={e=>ul(i,'label',e.target.value)} className="flex-1 text-xs border-2 border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-orange-500"/><input type="number" value={l.value} onChange={e=>ul(i,'value',+e.target.value)} className="w-24 text-xs border-2 border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 focus:outline-none focus:border-orange-500" style={{fontFamily:"var(--font-mono,monospace)"}}/><button onClick={()=>setLiabs(liabs.filter((_,j)=>j!==i))} className="text-red-400 hover:text-red-600 text-xs">✕</button></div>)}
      <button onClick={()=>setLiabs([...liabs,{label:'New Liability',value:0}])} className="text-xs text-orange-500 font-semibold hover:underline">+ Add liability</button>
    </>} right={<>
      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-3">Your Net Worth</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="result-card bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 text-center"><p className="text-xs text-teal-600 font-bold uppercase tracking-wide mb-1">Total Assets</p><p className="calc-num-md text-teal-700 dark:text-teal-400">{C.sym+fmtFull(r.totalAssets,2)}</p></div>
        <div className="result-card bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-center"><p className="text-xs text-red-600 font-bold uppercase tracking-wide mb-1">Total Debts</p><p className="calc-num-md text-red-500">{C.sym+fmtFull(r.totalLiab,2)}</p></div>
        <div className={`result-card text-center ${r.netWorth>=0?'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800':'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'}`}><p className={`text-xs font-bold uppercase tracking-wide mb-1 ${r.netWorth>=0?'text-green-600':'text-orange-600'}`}>Net Worth</p><p className={`calc-num-md ${r.netWorth>=0?'text-green-600 dark:text-green-400':'text-orange-500'}`}>{C.sym+fmtFull(r.netWorth,2)}</p></div>
      </div>
      <div className="grid grid-cols-2 gap-2">{assets.map(a=><div key={a.label} className="flex justify-between items-center p-3 bg-teal-50 dark:bg-teal-950/20 rounded-xl"><span className="text-xs text-gray-600 dark:text-gray-400 truncate">{a.label}</span><span className="calc-num-sm text-teal-700 dark:text-teal-400 ml-2 flex-shrink-0">{C.sym+fmtFull(a.value,2)}</span></div>)}{liabs.map(l=><div key={l.label} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-xl"><span className="text-xs text-gray-600 dark:text-gray-400 truncate">{l.label}</span><span className="calc-num-sm text-red-500 ml-2 flex-shrink-0">−{C.sym+fmtFull(l.value,2)}</span></div>)}</div>
      <button onClick={saveSnapshot} className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-all">
        {saved ? '✓ Snapshot saved!' : '📌 Save this month\'s snapshot'}
      </button>

      {nextMilestone && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3.5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-gray-600 dark:text-gray-300">Next milestone: {C.sym}{fmtSmart(nextMilestone, C.sym)}</span>
            <span className="text-gray-400">{Math.round(milestonePct)}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-400 rounded-full transition-all duration-700" style={{ width: `${milestonePct}%` }} />
          </div>
        </div>
      )}

      {score && fireProgress != null && (
        <div className="rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 p-3.5">
          <p className="text-xs font-bold text-teal-700 dark:text-teal-400 mb-1">🔥 {fireProgress}% of your current-trajectory net worth at 60</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">From your WellFiLab Score's projections, based on your real income and SIP. <Link href="/roadmap" className="underline hover:text-teal-600 dark:hover:text-teal-400">See the actions that move this number →</Link></p>
        </div>
      )}
      {!score && (
        <Link href="/score" className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400">
          📊 Get your WellFiLab Score to see this against your real retirement trajectory →
        </Link>
      )}
    </>}/>

    <div className="p-6 border-t border-gray-100 dark:border-gray-800">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Your net worth over time</h3>
      {history.length === 0 ? (
        <p className="text-sm text-gray-400">Save a snapshot above to start tracking. Track monthly to see your wealth growing — the trend matters more than the number.</p>
      ) : (
        <>
          {change != null && (
            <p className={`text-sm font-bold mb-3 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '↑' : '↓'} {C.sym}{fmtFull(Math.abs(change),0)} since last snapshot
            </p>
          )}
          {history.length > 1 && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{top:5,right:5,bottom:5,left:5}}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="month" tick={{fontSize:11}}/>
                  <YAxis tickFormatter={v=>fmtSmart(v,C.sym)} tick={{fontSize:10}} width={70}/>
                  <Tooltip formatter={(v:number)=>[`${C.sym}${fmtFull(v,0)}`,'Net worth']}/>
                  <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2.5} dot={{r:3}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 uppercase tracking-wide">
                  <th className="pb-2 font-bold">Date</th><th className="pb-2 font-bold">Assets</th><th className="pb-2 font-bold">Liabilities</th><th className="pb-2 font-bold">Net Worth</th><th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {[...history].reverse().map(s => (
                  <tr key={s.id}>
                    <td className="py-2 text-gray-500 dark:text-gray-400">{new Date(s.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                    <td className="py-2 text-teal-600 dark:text-teal-400 font-semibold">{C.sym}{fmtFull(s.assets,0)}</td>
                    <td className="py-2 text-red-500 font-semibold">{C.sym}{fmtFull(s.liabilities,0)}</td>
                    <td className="py-2 font-bold text-gray-900 dark:text-white">{C.sym}{fmtFull(s.netWorth,0)}</td>
                    <td className="py-2 text-right"><button onClick={()=>removeSnapshot(s.id)} className="text-gray-300 hover:text-red-500">✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 mt-3 underline">Clear all history</button>
        </>
      )}
    </div>
    </>
  );
}
