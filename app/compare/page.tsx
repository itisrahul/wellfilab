'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CALCULATORS } from '@/config/tools';
import { ToolRenderer } from '@/components/tools/ToolRenderer';

const popular = CALCULATORS.filter(c => c.popular);

export default function ComparePage() {
  const [left,  setLeft]  = useState<string>(popular[0]?.slug ?? '');
  const [right, setRight] = useState<string>(popular[4]?.slug ?? '');
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? CALCULATORS.filter(c =>
        c.short.toLowerCase().includes(search.toLowerCase()) ||
        c.title.toLowerCase().includes(search.toLowerCase())
      )
    : CALCULATORS;

  const leftCalc  = CALCULATORS.find(c => c.slug === left);
  const rightCalc = CALCULATORS.find(c => c.slug === right);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-1">Side-by-side</p>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Compare Tools</h1>
              <p className="text-sm text-gray-400 mt-1">Run two calculators side by side. Pick from any of the {CALCULATORS.length} tools below.</p>
            </div>
            <Link href="/tools" className="text-sm text-teal-600 dark:text-teal-400 hover:underline font-medium flex-shrink-0">
              ← Back to all tools
            </Link>
          </div>

          {/* Tool selectors */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <ToolSelector
              label="Left panel"
              value={left}
              onChange={setLeft}
              exclude={right}
              calcs={CALCULATORS}
            />
            <ToolSelector
              label="Right panel"
              value={right}
              onChange={setRight}
              exclude={left}
              calcs={CALCULATORS}
            />
          </div>
        </div>
      </div>

      {/* Side by side panels */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Left */}
          <div>
            {leftCalc && (
              <div className="mb-3 flex items-center gap-2.5">
                <span className="text-2xl">{leftCalc.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{leftCalc.title}</p>
                  <p className="text-xs text-gray-400">{leftCalc.desc}</p>
                </div>
                <div className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${leftCalc.category === 'health' ? 'bg-teal-500' : 'bg-amber-500'}`}>
                  {leftCalc.category}
                </div>
              </div>
            )}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              {left ? <ToolRenderer slug={left} /> : <EmptySlot side="left" />}
            </div>
          </div>

          {/* Right */}
          <div>
            {rightCalc && (
              <div className="mb-3 flex items-center gap-2.5">
                <span className="text-2xl">{rightCalc.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{rightCalc.title}</p>
                  <p className="text-xs text-gray-400">{rightCalc.desc}</p>
                </div>
                <div className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${rightCalc.category === 'health' ? 'bg-teal-500' : 'bg-amber-500'}`}>
                  {rightCalc.category}
                </div>
              </div>
            )}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              {right ? <ToolRenderer slug={right} /> : <EmptySlot side="right" />}
            </div>
          </div>

        </div>

        {/* Popular compare combos */}
        <div className="mt-10">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Popular combinations</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { a:'bmi',        b:'calories',      label:'Weight management' },
              { a:'sip',        b:'retirement',    label:'Retirement planning' },
              { a:'loan',       b:'fire',          label:'Debt vs FIRE' },
              { a:'body-fat',   b:'heart-rate',    label:'Fitness check' },
              { a:'compound',   b:'sip',           label:'Growth strategies' },
              { a:'income-tax', b:'salary',        label:'Take-home pay' },
              { a:'sleep',      b:'calories-burned',label:'Daily wellness' },
              { a:'net-worth',  b:'retirement',    label:'Net worth vs goal' },
            ].map(combo => (
              <button key={`${combo.a}-${combo.b}`}
                onClick={() => { setLeft(combo.a); setRight(combo.b); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-3 p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-800 hover:shadow-sm transition-all text-left group">
                <span className="text-base">{CALCULATORS.find(c=>c.slug===combo.a)?.icon}</span>
                <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                </svg>
                <span className="text-base">{CALCULATORS.find(c=>c.slug===combo.b)?.icon}</span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {combo.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolSelector({
  label, value, onChange, exclude, calcs,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  exclude: string;
  calcs: typeof CALCULATORS;
}) {
  const [open, setOpen] = useState(false);
  const [q,    setQ]    = useState('');

  const options = calcs
    .filter(c => c.slug !== exclude)
    .filter(c => !q.trim() || c.short.toLowerCase().includes(q.toLowerCase()) || c.title.toLowerCase().includes(q.toLowerCase()));

  const current = calcs.find(c => c.slug === value);

  return (
    <div className="relative">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-teal-400 dark:hover:border-teal-600 transition-all text-left">
        {current ? (
          <>
            <span className="text-xl">{current.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{current.short}</p>
              <p className="text-xs text-gray-400 truncate">{current.desc}</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">Choose a calculator…</p>
        )}
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-gray-800">
            <input type="search" value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search tools…"
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {options.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">No tools found</p>
            ) : (
              options.map(c => (
                <button key={c.slug}
                  onClick={() => { onChange(c.slug); setOpen(false); setQ(''); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    c.slug === value ? 'bg-teal-50 dark:bg-teal-950/30' : ''
                  }`}>
                  <span className="text-base flex-shrink-0">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{c.short}</p>
                    <p className="text-xs text-gray-400 truncate">{c.desc}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 text-white ${
                    c.category === 'health' ? 'bg-teal-500' : 'bg-amber-500'
                  }`}>{c.category[0].toUpperCase()}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptySlot({ side }: { side: 'left' | 'right' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <p className="text-4xl mb-3">{side === 'left' ? '⬆️' : '⬆️'}</p>
      <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Select a tool above</p>
      <p className="text-xs text-gray-400">Choose any calculator to load it here</p>
    </div>
  );
}
