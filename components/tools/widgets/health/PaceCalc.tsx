'use client';
import { useState, useEffect } from 'react';
import { calcRunningPace } from '@/lib/calc';
import { Shell, NumIn, SelectIn, Stat, Box, Table } from '@/components/tools/shared';
import { saveHistory } from '@/components/ui/CalcHistory';

const RACES = [
  { label: '5K', km: 5 },
  { label: '10K', km: 10 },
  { label: 'Half Marathon (21.1K)', km: 21.1 },
  { label: 'Marathon (42.2K)', km: 42.2 },
  { label: 'Custom distance', km: 0 },
];

export default function PaceCalc() {
  const [raceIdx, setRaceIdx] = useState(2);
  const [customKm, setCustomKm] = useState(10);
  const [h, setH] = useState(2);
  const [m, setM] = useState(0);
  const [s, setS] = useState(0);
  const dist = RACES[raceIdx].km || customKm;
  const r = calcRunningPace(dist, h, m, s);

  useEffect(() => {
    saveHistory({
      calcSlug: 'pace', calcName: 'Running Pace Calculator',
      summary: `${dist}km in ${h}h${m}m → pace ${r.paceMinPerKm}/km`,
      inputs: { dist, h, m, s },
    });
  }, [dist, h, m, s]);

  return (
    <Shell
      left={<>
        <SelectIn label="Race distance" value={raceIdx} onChange={v=>setRaceIdx(+v)}
          options={RACES.map((r,i)=>({value:i,label:r.label}))}/>
        {RACES[raceIdx].km === 0 && (
          <NumIn label="Distance (km)" value={customKm} onChange={setCustomKm} min={0.5} max={100} step={0.5}/>
        )}
        <div>
          <label className="calc-label">Goal finish time</label>
          <div className="grid grid-cols-3 gap-2">
            <NumIn label="Hours" value={h} onChange={setH} min={0} max={10}/>
            <NumIn label="Minutes" value={m} onChange={setM} min={0} max={59}/>
            <NumIn label="Seconds" value={s} onChange={setS} min={0} max={59}/>
          </div>
        </div>
      </>}
      right={<>
        <h3 className="text-xl font-bold text-teal-600 dark:text-teal-400 border-b border-gray-100 dark:border-gray-800 pb-3">
          Required pace for {dist}km
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="result-card bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800">
            <p className="result-label text-teal-600 dark:text-teal-400">Pace per km</p>
            <p className="calc-num-lg text-teal-600 dark:text-teal-400">{r.paceMinPerKm}</p>
          </div>
          <Stat label="Pace per mile" value={r.paceMinPerMile} color="text-gray-600"/>
        </div>
        {r.splits.length > 0 && r.splits.length <= 42 && (
          <Table headers={['Km', 'Split time']} rows={r.splits.map(s => [String(s.km), s.time])}/>
        )}
        <Box icon="💡 Even pacing" color="teal"
          text="This assumes a perfectly even pace across the whole distance. In practice, most runners benefit from a slightly conservative start and a faster back half ('negative split') rather than going out at exactly goal pace from the gun."/>
      </>}
    />
  );
}
