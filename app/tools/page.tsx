'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CALCULATORS, getGroups } from '@/config/tools';

const POPULAR_SLUGS = ['bmi','calories','body-fat','sleep','blood-pressure','sip','loan','retirement','income-tax','fire'];

const GROUP_ICON: Record<string,string> = {
  'Body & Weight':'⚖️','Fitness':'🏃','Nutrition':'🥗','Life':'🌿',
  'Grow Money':'📈','Borrow Money':'🏦','Plan Ahead':'🎯','Tax & Pay':'💳','Insurance':'🛡️','Tools':'🔧',
};

export default function ToolsPage() {
  const [q,      setQ]      = useState('');
  const [tab,    setTab]    = useState<'all'|'health'|'finance'>('all');

  const popular = POPULAR_SLUGS.map(s => CALCULATORS.find(c => c.slug === s)).filter(Boolean) as typeof CALCULATORS;
  const hGroups = getGroups('health');
  const fGroups = getGroups('finance');
  const hCount  = CALCULATORS.filter(c => c.category === 'health').length;
  const fCount  = CALCULATORS.filter(c => c.category === 'finance').length;

  const filtered = useMemo(() => {
    let list = tab === 'all' ? CALCULATORS : CALCULATORS.filter(c => c.category === tab);
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter(c =>
        c.short.toLowerCase().includes(t) ||
        c.title.toLowerCase().includes(t) ||
        c.desc.toLowerCase().includes(t) ||
        c.tags.some(tag => tag.includes(t))
      );
    }
    return list;
  }, [q, tab]);

  const isSearching = q.trim().length > 0;
  const showCats = tab === 'all' || isSearching;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ── Dashboard header ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-7">

          {/* Label + headline */}
          <div className="flex items-start justify-between gap-6 flex-wrap mb-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">
                Free Calculators
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {CALCULATORS.length} Tools. <span className="text-teal-600 dark:text-teal-400">Instant Results.</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                Runs in your browser · No signup · No ads · 100% private
              </p>
            </div>
            {/* Stats */}
            <div className="flex gap-6 text-center flex-shrink-0">
              <div>
                <p className="text-2xl font-black text-teal-600 dark:text-teal-400">{hCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">Health</p>
              </div>
              <div className="w-px bg-gray-200 dark:bg-gray-700" />
              <div>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{fCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">Finance</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="search" value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search by name, category, or keyword…"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl
                         bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100
                         placeholder-gray-400 focus:outline-none focus:border-teal-500 dark:focus:border-teal-400
                         focus:bg-white dark:focus:bg-gray-900 transition-all"
            />
            {q && (
              <button onClick={() => setQ('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex gap-2">
            {[
              { id:'all',     label:`All (${CALCULATORS.length})` },
              { id:'health',  label:`Health (${hCount})` },
              { id:'finance', label:`Finance (${fCount})` },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  tab === t.id
                    ? 'bg-teal-600 text-white border-transparent'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Search results ── */}
        {isSearching ? (
          <section>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {filtered.length > 0
                ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${q}"`
                : `No tools matched "${q}"`}
            </p>
            {filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {filtered.map(c => (
                  <Link key={c.slug} href={`/tools/${c.category}/${c.slug}`}
                    className={`flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border hover:shadow-sm transition-all group ${
                      c.category === 'health'
                        ? 'border-gray-100 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-800'
                        : 'border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800'
                    }`}>
                    <span className="text-2xl flex-shrink-0">{c.icon}</span>
                    <div className="min-w-0">
                      <p className={`font-semibold text-sm group-hover:underline ${c.category === 'health' ? 'text-teal-700 dark:text-teal-400' : 'text-amber-700 dark:text-amber-400'}`}>{c.short}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{c.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-3xl mb-3">🔍</p>
                <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1">No tools matched</p>
                <p className="text-sm text-gray-400 mb-4">Try "BMI", "SIP", "calories", or "tax"</p>
                <button onClick={() => setQ('')} className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline">
                  Clear search
                </button>
              </div>
            )}
          </section>

        ) : (
          <div className="space-y-12">

            {/* Popular picks */}
            {tab === 'all' && (
              <section>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Most Used</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {popular.map(c => (
                    <Link key={c.slug} href={`/tools/${c.category}/${c.slug}`}
                      className={`flex items-center gap-2.5 p-3.5 rounded-xl border bg-white dark:bg-gray-900 hover:shadow-sm transition-all group ${
                        c.category === 'health'
                          ? 'border-teal-100 dark:border-teal-900 hover:border-teal-200'
                          : 'border-amber-100 dark:border-amber-900 hover:border-amber-200'
                      }`}>
                      <span className="text-xl flex-shrink-0">{c.icon}</span>
                      <span className={`text-xs font-semibold truncate group-hover:underline ${c.category === 'health' ? 'text-teal-700 dark:text-teal-400' : 'text-amber-700 dark:text-amber-400'}`}>
                        {c.short}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Full directory */}
            {(tab === 'all' || tab === 'health') && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">🌿</div>
                    <div>
                      <h2 className="font-bold text-base text-gray-900 dark:text-gray-100">Health</h2>
                      <p className="text-xs text-gray-400">{hCount} calculators</p>
                    </div>
                  </div>
                  <Link href="/tools/health" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">View category →</Link>
                </div>
                <div className="space-y-6">
                  {Object.entries(hGroups).map(([group, calcs]) => (
                    <div key={group}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">{GROUP_ICON[group] ?? '📂'}</span>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{group}</p>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                        {calcs.map(c => (
                          <Link key={c.slug} href={`/tools/health/${c.slug}`}
                            className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-800 hover:bg-teal-50/30 dark:hover:bg-teal-950/10 transition-all group">
                            <span className="text-lg flex-shrink-0 mt-0.5">{c.icon}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">{c.short}</p>
                                {c.popular && <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />}
                              </div>
                              <p className="text-xs text-gray-400 truncate mt-0.5">{c.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(tab === 'all' || tab === 'finance') && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-white text-sm font-bold">💰</div>
                    <div>
                      <h2 className="font-bold text-base text-gray-900 dark:text-gray-100">Finance</h2>
                      <p className="text-xs text-gray-400">{fCount} calculators</p>
                    </div>
                  </div>
                  <Link href="/tools/finance" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">View category →</Link>
                </div>
                <div className="space-y-6">
                  {Object.entries(fGroups).map(([group, calcs]) => (
                    <div key={group}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">{GROUP_ICON[group] ?? '📂'}</span>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{group}</p>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                        {calcs.map(c => (
                          <Link key={c.slug} href={`/tools/finance/${c.slug}`}
                            className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800 hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition-all group">
                            <span className="text-lg flex-shrink-0 mt-0.5">{c.icon}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors truncate">{c.short}</p>
                                {c.popular && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />}
                              </div>
                              <p className="text-xs text-gray-400 truncate mt-0.5">{c.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
