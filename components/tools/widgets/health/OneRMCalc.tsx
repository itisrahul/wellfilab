'use client';
import { useState } from 'react';
import { Shell, NumIn, PctIn, Stat, Box, TC } from '@/components/tools/shared';

const FORMULAS = [
  { name: 'Epley',     fn: (w: number, r: number) => w * (1 + r / 30) },
  { name: 'Brzycki',   fn: (w: number, r: number) => r < 37 ? w * 36 / (37 - r) : w * 36 },
  { name: 'Lombardi',  fn: (w: number, r: number) => w * Math.pow(r, 0.1) },
  { name: 'Mayhew',    fn: (w: number, r: number) => 100 * w / (52.2 + 41.9 * Math.pow(Math.E, -0.055 * r)) },
  { name: 'O\'Conner', fn: (w: number, r: number) => w * (1 + r / 40) },
];

const PERCENTAGES = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];

export default function OneRMCalc() {
  const [weight, setWeight] = useState(100);
  const [reps,   setReps]   = useState(5);
  const [unit,   setUnit]   = useState<'kg' | 'lbs'>('kg');

  const results = FORMULAS.map(f => ({ name: f.name, orm: Math.round(f.fn(weight, reps) * 10) / 10 }));
  const avgOrm  = Math.round(results.reduce((s, r) => s + r.orm, 0) / results.length * 10) / 10;

  return (
    <Shell left={<>
      <div className="flex gap-2 mb-3">
        {(['kg','lbs'] as const).map(u => (
          <button key={u} onClick={() => setUnit(u)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${unit===u?'bg-orange-500 text-white border-orange-500':'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500'}`}>
            {u}
          </button>
        ))}
      </div>
      <NumIn label={`Weight lifted (${unit})`} value={weight} onChange={setWeight} min={1} max={500} step={2.5}/>
      <NumIn label="Reps completed" value={reps} onChange={setReps} min={1} max={36} step={1}
        hint={reps > 12 ? "Best accuracy below 12 reps" : undefined}/>
      <Box icon="💡 How to test safely" color="teal"
        text="Warm up thoroughly. Use a spotter. For 1RM estimation, pick a weight you can lift 3–8 reps with good form. Never test true 1RM without a spotter."/>
    </>} right={<>
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <h3 className="text-xl font-bold text-orange-500">1 Rep Max Estimate</h3>
        <p className="text-sm text-gray-500">{weight}{unit} × {reps} reps</p>
      </div>

      <div className="result-card bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 mb-4">
        <p className="result-label text-orange-600">Average 1RM (5 formulas)</p>
        <p className="calc-num-lg text-orange-500">{avgOrm} {unit}</p>
      </div>

      {/* Formula comparison */}
      <div className="mb-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">By formula</p>
        <div className="grid grid-cols-2 gap-2">
          {results.map(r => (
            <div key={r.name}><Stat label={r.name} value={`${r.orm} ${unit}`} color={TC.gray}/></div>
          ))}
        </div>
      </div>

      {/* Percentage table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-orange-500 px-4 py-2">
          <p className="text-xs font-bold text-white">Training weight by % of 1RM</p>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 dark:bg-gray-800">
            <th className="px-3 py-2 text-left text-xs font-bold text-gray-500">%</th>
            <th className="px-3 py-2 text-left text-xs font-bold text-gray-500">Weight ({unit})</th>
            <th className="px-3 py-2 text-left text-xs font-bold text-gray-500">Use for</th>
          </tr></thead>
          <tbody>
            {PERCENTAGES.map(pct => {
              const w = Math.round(avgOrm * pct / 100 * 4) / 4;
              const use = pct >= 95 ? '1–2 reps, max strength' : pct >= 85 ? '3–5 reps, strength' : pct >= 75 ? '6–8 reps, hypertrophy' : pct >= 65 ? '10–12 reps, muscle endurance' : '15+ reps, endurance';
              return (
                <tr key={pct} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-3 py-2 font-mono font-bold text-orange-500">{pct}%</td>
                  <td className="px-3 py-2 font-mono">{w}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{use}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>}/>
  );
}
