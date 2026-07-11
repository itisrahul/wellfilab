'use client';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CURRENCIES } from '@/lib/calc';

const KEY = 'wfl_currency_pref';

export type CurrencyCode = string;

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  sym: string;
  flag: string;
  name: string;
}

const DEFAULT_CTX: CurrencyContextValue = {
  currency: 'USD', setCurrency: () => {}, sym: '$', flag: '🇺🇸', name: 'US Dollar',
};
const CurrencyContext = createContext<CurrencyContextValue>(DEFAULT_CTX);

export function CurrencyProvider({ children }: { children?: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && CURRENCIES.find(c => c.code === saved)) {
        setCurrencyState(saved);
      } else {
        // Detect from browser locale
        const locale = navigator.language || 'en-US';
        const detected = detectCurrencyFromLocale(locale);
        if (detected) setCurrencyState(detected);
      }
    } catch {}
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    try { localStorage.setItem(KEY, code); } catch {}
  }, []);

  const meta = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0];

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, sym: meta.sym, flag: meta.flag, name: meta.name }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext) as CurrencyContextValue;
}

/** Detect most likely currency from browser locale */
function detectCurrencyFromLocale(locale: string): CurrencyCode | null {
  const map: Record<string, string> = {
    'en-US': 'USD', 'en-CA': 'CAD', 'en-AU': 'AUD', 'en-GB': 'GBP',
    'en-IN': 'INR', 'en-SG': 'SGD', 'en-AE': 'AED', 'en-ZA': 'ZAR',
    'de': 'EUR', 'fr': 'EUR', 'es': 'EUR', 'it': 'EUR', 'nl': 'EUR',
    'pt-BR': 'BRL', 'zh': 'CNY', 'zh-CN': 'CNY',
    'ja': 'JPY', 'ko': 'KRW', 'ms': 'MYR',
  };
  // Try exact match first, then language-only
  return map[locale] ?? map[locale.split('-')[0]] ?? null;
}

/** Global currency selector widget — shows in a compact pill */
export function GlobalCurrencySelector() {
  const { currency, setCurrency, flag } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:border-teal-400 dark:hover:border-teal-600 transition-all"
        aria-label="Change currency">
        <span className="text-sm">{flag}</span>
        <span>{currency}</span>
        <svg className={`w-3 h-3 opacity-40 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-gray-800">
            Default currency
          </p>
          <div className="max-h-64 overflow-y-auto">
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => { setCurrency(c.code); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors ${
                  currency === c.code
                    ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                <span className="text-base flex-shrink-0">{c.flag}</span>
                <span className="flex-1">{c.name}</span>
                <span className="text-xs text-gray-400 font-mono">{c.sym}</span>
                {currency === c.code && (
                  <svg className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
          <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[10px] text-gray-400">Applies to all calculators. Saved on this device.</p>
          </div>
        </div>
      )}
    </div>
  );
}
