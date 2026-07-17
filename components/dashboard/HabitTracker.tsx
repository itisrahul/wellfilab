'use client';
import { useEffect, useState } from 'react';
import { getHabits, addHabit, deleteHabit, toggleToday, isDoneToday, habitStreak, type Habit } from '@/lib/habitsStorage';

const SUGGESTED = [
  { label: 'Sleep by 11pm', icon: '😴' },
  { label: 'Walk 20 minutes', icon: '🏃' },
  { label: 'No spending outside budget', icon: '💰' },
  { label: 'Drink 2L water', icon: '💧' },
];

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');

  useEffect(() => { getHabits().then(setHabits); }, []);
  const refresh = () => getHabits().then(setHabits);

  const toggle = async (id: string) => { await toggleToday(id); refresh(); };
  const remove = async (id: string) => { await deleteHabit(id); refresh(); };
  const addQuick = async (l: string, icon: string) => { await addHabit(l, icon); refresh(); };
  const addCustom = async () => {
    if (!label.trim()) return;
    await addHabit(label.trim(), '✅');
    setLabel(''); setAdding(false); refresh();
  };

  if (habits === null) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Daily habits</p>
        <button onClick={() => setAdding(a => !a)} className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
          {adding ? 'Cancel' : '+ Add habit'}
        </button>
      </div>

      {adding && (
        <div className="mb-4 space-y-2.5">
          <div className="flex gap-2">
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Read 10 pages"
              onKeyDown={e => { if (e.key === 'Enter') addCustom(); }}
              className="flex-1 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500" />
            <button onClick={addCustom} className="px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold">Add</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED.filter(s => !habits.some(h => h.label === s.label)).map(s => (
              <button key={s.label} onClick={() => addQuick(s.label, s.icon)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors">
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {habits.length === 0 && !adding ? (
        <p className="text-sm text-gray-400">No habits tracked yet. Small daily actions compound — add one to start a streak.</p>
      ) : (
        <div className="space-y-2">
          {habits.map(h => {
            const done = isDoneToday(h);
            const streak = habitStreak(h);
            return (
              <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 group">
                <button onClick={() => toggle(h.id)}
                  className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${done ? 'bg-teal-600 border-teal-600 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-teal-400'}`}>
                  {done && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                </button>
                <span className="text-lg flex-shrink-0">{h.icon}</span>
                <span className={`text-sm flex-1 min-w-0 truncate ${done ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300 font-medium'}`}>{h.label}</span>
                {streak > 0 && <span className="text-xs font-bold text-amber-500 flex-shrink-0">🔥{streak}</span>}
                <button onClick={() => remove(h.id)} className="text-gray-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
