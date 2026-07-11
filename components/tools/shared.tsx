/**
 * shared.tsx — Reusable UI for all calculator widgets.
 *
 * Key fixes:
 *  1. Number inputs use string state internally to allow empty/partial values
 *  2. Display "0" not "–" or "Ø" in tables
 *  3. fmtFull uses browser locale for number formatting (adapts globally)
 *  4. Orange accent throughout
 *  5. JetBrains Mono for all numbers
 */
'use client';
import { useState, useCallback, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { CURRENCIES } from '@/lib/calc';
export { CURRENCIES };

// ── Number formatting ─────────────────────────────────────────────────────────

/** Full number — en-IN locale gives ₹5,00,000.00 format */
// Smart formatter: shows short form (₹64.16L) for large numbers
export function fmtSmart(n: number, sym = ''): string {
  const abs = Math.abs(n);
  if (abs >= 1e12) return sym + (n / 1e12).toFixed(2) + 'T';
  if (abs >= 1e7)  return sym + (n / 1e7).toFixed(2) + 'Cr';
  if (abs >= 1e5)  return sym + (n / 1e5).toFixed(2) + 'L';
  if (abs >= 1000) return sym + (n / 1000).toFixed(2) + 'K';
  return sym + n.toFixed(2);
}

export function fmtFull(n: number, decimals = 2): string {
  if (!isFinite(n)) return '0.00';
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function fmtCurrency(n: number, sym: string, decimals = 2): string {
  return sym + fmtFull(n, decimals);
}

export function fmtPct(n: number, decimals = 2): string {
  return fmtFull(n, decimals) + '%';
}

// ── Currency hook ─────────────────────────────────────────────────────────────
export function useCurr(code: string) {
  const c = CURRENCIES.find(x => x.code === code) ?? CURRENCIES[0];
  const fmt  = (n: number, dec = 2) => fmtCurrency(n, c.sym, dec);
  const full = (n: number, dec = 2) => c.sym + fmtFull(n, dec);
  return { ...c, fmt, full };
}

// ── Copy button ───────────────────────────────────────────────────────────────
export function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };
  return (
    <button onClick={copy} className="copy-btn" title="Copy value">
      {copied
        ? <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth={2}/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth={2}/></svg>
      }
    </button>
  );
}

// ── Currency selector ─────────────────────────────────────────────────────────
export function CurrPills({ val, onChange }: { val: string; onChange: (c: string) => void }) {
  return (
    <div>
      <label className="calc-label">Currency</label>
      <div className="flex flex-wrap gap-1.5">
        {CURRENCIES.map(c => (
          <button key={c.code} onClick={() => onChange(c.code)} title={`${c.name} (${c.code})`}
            className={`curr-pill ${val === c.code ? 'curr-pill-active' : 'curr-pill-inactive'}`}>
            <span className="mr-0.5">{c.flag}</span>{c.sym}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {CURRENCIES.find(c => c.code === val)?.name}
      </p>
    </div>
  );
}

// ── Form inputs ───────────────────────────────────────────────────────────────
export function Label({ children }: { children?: ReactNode }) {
  return <label className="calc-label">{children}</label>;
}

export function Field(p: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={`calc-input ${p.className ?? ''}`} />;
}

export function Select({ children, ...p }: SelectHTMLAttributes<HTMLSelectElement> & { children?: ReactNode }) {
  return <select {...p} className="calc-select w-full">{children}</select>;
}

/**
 * SmartNumInput — uses string state so user can clear field and type freely.
 * Prevents leading zeros (05.4 → 5.4).
 * Shows empty string while typing, commits numeric value on blur.
 */
function SmartNumInput({
  value, onChange, min, max, step = 1, placeholder,
  className = '',
}: {
  value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; placeholder?: string; className?: string;
}) {
  const [raw, setRaw] = useState('');
  const [focused, setFocused] = useState(false);

  const display = focused ? raw : (value === 0 ? '' : String(value));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    // Remove leading zeros (but allow "0." for decimals)
    if (v.length > 1 && v.startsWith('0') && !v.startsWith('0.')) {
      v = v.replace(/^0+/, '');
    }
    setRaw(v);
    const n = parseFloat(v);
    if (!isNaN(n)) {
      const clamped = min !== undefined ? Math.max(min, n) : n;
      onChange(max !== undefined ? Math.min(max, clamped) : clamped);
    } else if (v === '' || v === '-') {
      onChange(0);
    }
  };

  const handleFocus = () => {
    setFocused(true);
    setRaw(value === 0 ? '' : String(value));
  };

  const handleBlur = () => {
    setFocused(false);
    setRaw('');
  };

  return (
    <input
      type="number"
      value={display}
      min={min} max={max} step={step}
      placeholder={placeholder ?? '0'}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={`flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none text-gray-900 dark:text-gray-100 min-w-0 ${className}`}
      style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)' }}
    />
  );
}

/** Number input with optional suffix */
export function NumIn({ label, value, onChange, min, max, step = 1, suffix, hint, placeholder }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; suffix?: string; hint?: string; placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-900 focus-within:border-orange-500 transition-all">
        <SmartNumInput value={value} onChange={onChange} min={min} max={max} step={step} placeholder={placeholder} />
        {suffix && <span className="px-3 flex items-center text-gray-500 font-semibold bg-gray-100 dark:bg-gray-800 border-l border-gray-300 dark:border-gray-600 text-sm flex-shrink-0">{suffix}</span>}
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

/** Money input with currency symbol prefix */
export function MoneyIn({ label, value, onChange, sym, step = 1000, hint, placeholder }: {
  label: string; value: number; onChange: (v: number) => void;
  sym: string; step?: number; hint?: string; placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-900 focus-within:border-orange-500 transition-all">
        <span className="px-3 flex items-center text-gray-600 dark:text-gray-400 font-bold bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 text-sm flex-shrink-0">{sym}</span>
        <SmartNumInput value={value} onChange={onChange} step={step} placeholder={placeholder ?? '0'} />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

/** Percentage input */
export function PctIn({ label, value, onChange, step = 0.1, hint, placeholder }: {
  label: string; value: number; onChange: (v: number) => void;
  step?: number; hint?: string; placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-900 focus-within:border-orange-500 transition-all">
        <SmartNumInput value={value} onChange={onChange} step={step} min={0} max={100} placeholder={placeholder ?? '0'} />
        <span className="px-3 flex items-center text-gray-600 dark:text-gray-400 font-bold bg-gray-100 dark:bg-gray-800 border-l border-gray-300 dark:border-gray-600 text-sm flex-shrink-0">%</span>
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export function SelectIn({ label, value, onChange, options, hint }: {
  label: string; value: string | number; onChange: (v: string) => void;
  options: { value: string | number; label: string }[]; hint?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </Select>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

/** Two-option toggle */
export function Toggle({ v, a, b, onA, onB }: { v: boolean; a: string; b: string; onA: () => void; onB: () => void }) {
  return (
    <div className="flex overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-600">
      <button onClick={onA} className={`flex-1 py-2.5 text-sm font-semibold transition-all ${!v ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>{a}</button>
      <button onClick={onB} className={`flex-1 py-2.5 text-sm font-semibold transition-all ${v  ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>{b}</button>
    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export function Shell({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="calc-shell">
      <div className="calc-left">{left}</div>
      <div className="calc-right">{right}</div>
    </div>
  );
}

// ── Result display ────────────────────────────────────────────────────────────
export function BigResult({ label, value, rawValue, smartValue, color = 'orange', sub }: {
  label: string; value: string; rawValue?: string; smartValue?: string;
  color?: 'orange' | 'blue' | 'green' | 'gray'; sub?: string;
}) {
  const colors = {
    orange: 'text-orange-500 dark:text-orange-400',
    blue:   'text-blue-500 dark:text-blue-400',
    green:  'text-green-600 dark:text-green-400',
    gray:   'text-gray-500 dark:text-gray-400',
  };
  return (
    <div className="result-card group/res">
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <p className="result-label mb-0">{label}</p>
        {smartValue && (
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0 bg-gray-100 dark:bg-gray-800 ${colors[color]}`}>
            {smartValue}
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-1">
        <p className={`calc-num-lg flex-1 min-w-0 ${colors[color]}`}>{value}</p>
        {rawValue !== undefined && <CopyBtn value={rawValue} />}
      </div>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export function Stat({ label, value, color = 'text-gray-800 dark:text-gray-200', sub }: {
  label: string; value: string; color?: string; sub?: string;
}) {
  return (
    <div className="result-card">
      <p className="result-label">{label}</p>
      <p className={`calc-num-md ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export function Box({ icon, text, color = 'teal' }: {
  icon: string; text: string; color?: 'teal' | 'orange' | 'green' | 'red';
}) {
  const s = {
    teal:   'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300',
    orange: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
    red:    'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
    green:  'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
  };
  return (
    <div className={`rounded-xl p-4 border ${s[color]}`}>
      <p className="text-sm font-bold mb-1">{icon}</p>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}

/** Table — shows plain 0 not Ø */
export function Table({ headers, rows, note, headerColors }: {
  headers: string[];
  rows: (string | number)[][];
  note?: string;
  headerColors?: string[];
}) {
  const defColors = ['bg-gray-700', 'bg-orange-500', 'bg-orange-600', 'bg-teal-600', 'bg-teal-700'];
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 max-h-80">
      <table className="w-full breakdown-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className={(headerColors ?? defColors)[i] ?? 'bg-gray-600'}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri === rows.length - 1 ? 'font-bold bg-orange-50 dark:bg-orange-950/20' : ''}>
              {row.map((cell, ci) => (
                <td key={ci} className={`calc-num-sm ${ci === 0 ? 'text-gray-700 dark:text-gray-300' : 'text-right text-gray-800 dark:text-gray-100'}`}>
                  {/* Show plain 0, never Ø or – */}
                  {cell === '–' ? '0' : cell === '' ? '0' : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {note && <p className="text-xs text-gray-400 px-4 py-2 border-t border-gray-100 dark:border-gray-800">{note}</p>}
    </div>
  );
}

/** Table / Chart / Summary toggle */
export function ViewToggle({ v, onChange }: { v: string; onChange: (x: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 mr-1">View:</span>
      {[
        { k: 'table',   label: '⊞ Table' },
        { k: 'chart',   label: '📊 Chart' },
        { k: 'summary', label: '≡ Summary' },
      ].map(({ k, label }) => (
        <button key={k} onClick={() => onChange(k)}
          className={`px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all ${
            v === k
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-orange-400'
          }`}>
          {label}
        </button>
      ))}
    </div>
  );
}

/** Colour tokens */
export const TC = {
  orange: 'text-orange-500 dark:text-orange-400',
  teal:   'text-teal-600 dark:text-teal-400',
  green:  'text-green-600 dark:text-green-400',
  red:    'text-red-500',
  gray:   'text-gray-600 dark:text-gray-300',
  blue:   'text-blue-500 dark:text-blue-400',
} as const;
