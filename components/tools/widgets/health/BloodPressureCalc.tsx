'use client';
import { useState } from 'react';
import { Shell, NumIn, Stat, Box, TC } from '@/components/tools/shared';

interface Reading { systolic: number; diastolic: number; date: string; time: string }

function classify(s: number, d: number) {
  if (s < 90 || d < 60)   return { label:'Low (Hypotension)',         color:'text-blue-600',   bg:'bg-blue-50 dark:bg-blue-950/20',   border:'border-blue-200', risk:'low',    action:'Consult a doctor if you feel dizzy or faint.' };
  if (s < 120 && d < 80)  return { label:'Normal',                    color:'text-green-600',  bg:'bg-green-50 dark:bg-green-950/20', border:'border-green-200',risk:'normal', action:'Excellent! Maintain your healthy lifestyle.' };
  if (s < 130 && d < 80)  return { label:'Elevated',                  color:'text-yellow-600', bg:'bg-yellow-50 dark:bg-yellow-950/20',border:'border-yellow-200',risk:'low',  action:'Lifestyle changes recommended. Monitor closely.' };
  if (s < 140 || d < 90)  return { label:'High — Stage 1',            color:'text-orange-600', bg:'bg-orange-50 dark:bg-orange-950/20',border:'border-orange-200',risk:'med',  action:'Consult a doctor. Reduce sodium, exercise more.' };
  if (s < 180 && d < 120) return { label:'High — Stage 2',            color:'text-red-600',    bg:'bg-red-50 dark:bg-red-950/20',     border:'border-red-200',  risk:'high',   action:'See a doctor soon. Medication likely needed.' };
  return                          { label:'Crisis — Seek emergency care', color:'text-red-700', bg:'bg-red-50 dark:bg-red-950/20',     border:'border-red-300',  risk:'crisis', action:'Go to emergency room immediately.' };
}

function avgReading(readings: Reading[]) {
  if (!readings.length) return null;
  const s = Math.round(readings.reduce((a, r) => a + r.systolic, 0) / readings.length);
  const d = Math.round(readings.reduce((a, r) => a + r.diastolic, 0) / readings.length);
  return { s, d };
}

export default function BloodPressureCalc() {
  const [systolic,  setSys]   = useState(120);
  const [diastolic, setDia]   = useState(80);
  const [pulse,     setPulse] = useState(72);
  const [readings,  setReadings] = useState<Reading[]>([]);
  const [showLog,   setShowLog] = useState(false);

  const cat = classify(systolic, diastolic);
  const avg = avgReading(readings);
  const avgCat = avg ? classify(avg.s, avg.d) : null;
  const pp  = systolic - diastolic; // pulse pressure
  const map = Math.round(diastolic + pp / 3); // mean arterial pressure

  const addReading = () => {
    const now = new Date();
    setReadings(prev => [{
      systolic, diastolic,
      date: now.toLocaleDateString('en-IN'),
      time: now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }),
    }, ...prev].slice(0, 20));
  };

  return (
    <Shell left={<>
      <div className="space-y-4">
        <NumIn label="Systolic pressure (mmHg)" value={systolic} onChange={setSys} min={60} max={250} step={1}
          hint="Upper number — pressure when heart beats"/>
        <NumIn label="Diastolic pressure (mmHg)" value={diastolic} onChange={setDia} min={40} max={150} step={1}
          hint="Lower number — pressure between beats"/>
        <NumIn label="Pulse / Heart rate (bpm)" value={pulse} onChange={setPulse} min={30} max={200} step={1}/>
      </div>
      <button onClick={addReading}
        className="w-full mt-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition-all">
        + Save this reading
      </button>
      <button onClick={() => setShowLog(!showLog)}
        className="w-full mt-2 py-2 text-xs text-gray-500 hover:text-teal-600 transition-colors font-medium">
        {showLog ? 'Hide' : 'Show'} reading log ({readings.length})
      </button>
      {showLog && readings.length > 0 && (
        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
          {readings.map((r, i) => {
            const rc = classify(r.systolic, r.diastolic);
            return (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
                <span className="font-mono font-bold">{r.systolic}/{r.diastolic}</span>
                <span className={rc.color + ' font-medium'}>{rc.label.split('—')[0].trim()}</span>
                <span className="text-gray-400">{r.date} {r.time}</span>
              </div>
            );
          })}
        </div>
      )}
      <Box icon="⚠️ Disclaimer" color="teal"
        text="This tool is for tracking only, not medical diagnosis. Always consult a doctor for proper blood pressure evaluation and treatment."/>
    </>} right={<>
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <h3 className="text-xl font-bold text-teal-600">Blood Pressure Analysis</h3>
        <p className="text-sm text-gray-500">{systolic}/{diastolic} mmHg · Pulse {pulse} bpm</p>
      </div>

      {/* Classification */}
      <div className={`rounded-xl p-4 border mb-4 ${cat.bg} ${cat.border}`}>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Classification</p>
        <p className={`text-xl font-black ${cat.color}`}>{cat.label}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">{cat.action}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Pulse pressure" value={`${pp} mmHg`} color={pp > 60 ? 'text-orange-500' : TC.gray} sub={pp > 60 ? 'Elevated — consult doctor' : 'Normal range: 40–60 mmHg'}/>
        <Stat label="Mean arterial pressure" value={`${map} mmHg`} color={map > 110 ? 'text-red-500' : TC.gray} sub="Normal: 70–100 mmHg"/>
        <Stat label="Systolic" value={`${systolic} mmHg`} color={systolic >= 140 ? 'text-red-500' : systolic >= 120 ? 'text-orange-500' : TC.green}/>
        <Stat label="Diastolic" value={`${diastolic} mmHg`} color={diastolic >= 90 ? 'text-red-500' : diastolic >= 80 ? 'text-orange-500' : TC.green}/>
        <Stat label="Heart rate" value={`${pulse} bpm`} color={pulse > 100 || pulse < 60 ? 'text-orange-500' : TC.green} sub={pulse > 100 ? 'Elevated' : pulse < 60 ? 'Below normal (may be fine for athletes)' : 'Normal'}/>
        <Stat label="Readings logged" value={`${readings.length}`} color={TC.gray}/>
      </div>

      {/* Average from log */}
      {avg && avgCat && (
        <div className={`mt-3 rounded-xl p-4 border ${avgCat.bg} ${avgCat.border}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
            Average of {readings.length} readings
          </p>
          <p className={`text-lg font-bold ${avgCat.color}`}>{avg.s}/{avg.d} mmHg — {avgCat.label}</p>
        </div>
      )}

      {/* BP scale visual */}
      <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Blood pressure scale</p>
        {[
          { label:'Crisis', range:'180+', color:'bg-red-600', pct:100 },
          { label:'Stage 2', range:'140–179', color:'bg-red-400', pct:85 },
          { label:'Stage 1', range:'130–139', color:'bg-orange-400', pct:70 },
          { label:'Elevated', range:'120–129', color:'bg-yellow-400', pct:55 },
          { label:'Normal', range:'< 120', color:'bg-green-400', pct:40 },
          { label:'Low', range:'< 90', color:'bg-blue-400', pct:25 },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 mb-1.5">
            <span className="text-xs text-gray-500 w-16 text-right">{s.label}</span>
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div className={`h-full rounded-full ${s.color}`} style={{width:`${s.pct}%`}}/>
            </div>
            <span className="text-xs font-mono text-gray-400 w-16">{s.range}</span>
          </div>
        ))}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700"/>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${cat.bg} ${cat.color}`}>
            Your reading: {systolic}
          </span>
          <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700"/>
        </div>
      </div>
    </>}/>
  );
}
