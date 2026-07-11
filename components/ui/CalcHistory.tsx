'use client';
import { useEffect, useState } from 'react';

export interface HistoryEntry {
  id: string;
  calcSlug: string;
  calcName: string;
  summary: string;
  inputs: Record<string, string | number>;
  timestamp: number;
}

const KEY = 'hwt_calc_history';

export function saveHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>) {
  if (typeof window === 'undefined') return;
  try {
    const existing: HistoryEntry[] = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    const newEntry: HistoryEntry = { ...entry, id: Date.now().toString(), timestamp: Date.now() };
    const updated = [newEntry, ...existing.filter(e => e.calcSlug !== entry.calcSlug)].slice(0, 10);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export function CalcHistory({ currentSlug }: { currentSlug: string }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]') as HistoryEntry[];
      setHistory(stored.filter(e => e.calcSlug === currentSlug));
    } catch {}
  }, [currentSlug]);

  if (history.length === 0) return null;

  return (
    <div className="mb-4">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-500 transition-colors font-medium">
        <span>🕐</span>
        <span>{open ? 'Hide' : 'Show'} recent calculations ({history.length})</span>
        <span className="ml-0.5">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="mt-2 space-y-1.5">
          {history.map(e => (
            <div key={e.id} className="flex items-start justify-between gap-3 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{e.summary}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {new Date(e.timestamp).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
