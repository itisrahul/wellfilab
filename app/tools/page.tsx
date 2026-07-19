'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { CALCULATORS, getGroups, getBySlug, type Calculator } from '@/config/tools';
import { ScoreCTA } from '@/components/ui/ScoreCTA';

const QUICK_PILLS = ['sip', 'loan', 'retirement', 'bmi', 'calories', 'fire', 'compound', 'weight-loss'];

const GOAL_CARDS: { title: string; icon: string; gradient: string; slugs: string[] }[] = [
  { title: 'Grow Wealth',         icon: '📈', gradient: 'from-teal-600 to-emerald-500',  slugs: ['sip', 'compound', 'retirement'] },
  { title: 'Retire Early',        icon: '🔥', gradient: 'from-amber-600 to-orange-500',  slugs: ['fire', 'net-worth', 'savings-goal'] },
  { title: 'Become Debt Free',    icon: '🧹', gradient: 'from-rose-600 to-red-500',      slugs: ['loan', 'debt-payoff', 'emergency-fund'] },
  { title: 'Lose Weight',         icon: '⚖️', gradient: 'from-cyan-600 to-teal-500',     slugs: ['bmi', 'calories', 'weight-loss'] },
  { title: 'Improve Health',      icon: '💪', gradient: 'from-indigo-600 to-purple-500', slugs: ['body-fat', 'sleep', 'blood-pressure'] },
];

const JOURNEYS: { title: string; icon: string; slugs: string[] }[] = [
  { title: 'Beginner Investor',   icon: '🌱', slugs: ['compound', 'sip', 'retirement', 'fire'] },
  { title: 'Weight Loss Journey', icon: '⚖️', slugs: ['bmi', 'calories', 'weight-loss', 'body-fat'] },
  { title: 'Debt Freedom Journey', icon: '🧹', slugs: ['loan', 'debt-payoff', 'emergency-fund'] },
];

const NEW_SLUGS = CALCULATORS.filter(c => c.new).map(c => c.slug);

const GROUP_ICON: Record<string, string> = {
  'Body & Weight': '⚖️', 'Fitness': '🏃', 'Nutrition': '🥗', 'Life': '🌿',
  'Grow Money': '📈', 'Borrow Money': '🏦', 'Plan Ahead': '🎯', 'Tax & Pay': '💳', 'Insurance': '🛡️', 'Tools': '🔧',
};

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface TrendRow { slug: string; thisWeek: number; lastWeek: number; pctChange: number }
interface PopularRow { slug: string; total: number }

function ToolLink({ c, children, className }: { c: Calculator; children: React.ReactNode; className: string }) {
  return <Link href={`/tools/${c.category}/${c.slug}`} className={className}>{children}</Link>;
}

export default function ToolsPage() {
  const [q, setQ] = useState('');
  const [showSuggest, setShowSuggest] = useState(false);
  const [tab, setTab] = useState<'all' | 'health' | 'finance'>('all');
  const [sort, setSort] = useState<'popular' | 'alpha'>('popular');
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: viewData } = useSWR<{ trending: TrendRow[]; popular: PopularRow[] }>('/api/tool-views', fetcher);

  const hCount = CALCULATORS.filter(c => c.category === 'health').length;
  const fCount = CALCULATORS.filter(c => c.category === 'finance').length;
  const hGroups = getGroups('health');
  const fGroups = getGroups('finance');

  // Instant search suggestions (hero) — top 8 matches, dropdown style
  const suggestions = useMemo(() => {
    if (!q.trim()) return [];
    const t = q.trim().toLowerCase();
    return CALCULATORS.filter(c =>
      c.short.toLowerCase().includes(t) || c.title.toLowerCase().includes(t) ||
      c.desc.toLowerCase().includes(t) || c.tags.some(tag => tag.includes(t))
    ).slice(0, 8);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggest(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Real trending — top 6, only shown when there's genuine week-over-week data
  const trending = (viewData?.trending ?? [])
    .map(r => ({ row: r, calc: getBySlug(r.slug) }))
    .filter((x): x is { row: TrendRow; calc: Calculator } => !!x.calc)
    .slice(0, 6);

  // Most popular — real view counts first, topped up with editorially-flagged
  // tools (no fabricated count shown for those) so the section isn't empty
  // before real traffic accumulates.
  const popularReal = (viewData?.popular ?? [])
    .map(r => ({ row: r, calc: getBySlug(r.slug) }))
    .filter((x): x is { row: PopularRow; calc: Calculator } => !!x.calc);
  const popularRealSlugs = new Set(popularReal.map(p => p.calc.slug));
  const popularFallback = CALCULATORS.filter(c => c.popular && !popularRealSlugs.has(c.slug))
    .map(c => ({ row: null as PopularRow | null, calc: c }));
  const popular = [...popularReal.map(p => ({ row: p.row as PopularRow | null, calc: p.calc })), ...popularFallback].slice(0, 8);

  const newTools = CALCULATORS.filter(c => c.new);

  const directoryList = useMemo(() => {
    let list = tab === 'all' ? CALCULATORS : CALCULATORS.filter(c => c.category === tab);
    if (sort === 'alpha') list = [...list].sort((a, b) => a.short.localeCompare(b.short));
    return list;
  }, [tab, sort]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ══════════════════════════════════════════════
          SECTION 1 · HERO
      ══════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(13,148,136,0.15) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight mb-4 text-balance">
            {CALCULATORS.length} Free Health &amp; Finance Calculators
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg mb-8">
            Instant results. No signup. No ads. 100% private.
          </p>

          {/* Search with instant suggestions */}
          <div ref={searchRef} className="relative max-w-xl mx-auto mb-6">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search" value={q}
              onChange={e => { setQ(e.target.value); setShowSuggest(true); }}
              onFocus={() => setShowSuggest(true)}
              placeholder="Search calculators, topics, or goals…"
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 focus:shadow-md transition-all"
            />
            {showSuggest && suggestions.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden text-left">
                {suggestions.map(c => (
                  <Link key={c.slug} href={`/tools/${c.category}/${c.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <span className="text-xl flex-shrink-0">{c.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{c.short}</p>
                      <p className="text-xs text-gray-400 truncate">{c.desc}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${c.category === 'health' ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'}`}>{c.category}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick-access pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {QUICK_PILLS.map(slug => {
              const c = getBySlug(slug);
              if (!c) return null;
              return (
                <Link key={slug} href={`/tools/${c.category}/${c.slug}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-sm text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all">
                  🔥 {c.short}
                </Link>
              );
            })}
          </div>

          {/* Counts */}
          <div className="flex justify-center gap-8">
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{CALCULATORS.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Tools</p>
            </div>
            <div className="w-px bg-gray-200 dark:bg-gray-700" />
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
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-16">

        {/* ══════════════════════════════════════════════
            SECTION 2 · TRENDING THIS WEEK — real data only,
            hidden entirely until there's a genuine week-over-week signal
        ══════════════════════════════════════════════ */}
        {trending.length > 0 && (
          <section>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-5">📈 Trending This Week</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trending.map(({ row, calc }) => (
                <ToolLink key={calc.slug} c={calc}
                  className="group relative p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{calc.icon}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full">
                      ↑ {row.pctChange}% this week
                    </span>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{calc.short}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{calc.desc}</p>
                </ToolLink>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════
            SECTION 3 · MOST POPULAR — real usage counts where we have
            them, editorial curation (no fabricated numbers) to fill in
            the rest until real traffic data builds up
        ══════════════════════════════════════════════ */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-5">⭐ Most Popular Calculators</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popular.map(({ row, calc }) => (
              <ToolLink key={calc.slug} c={calc}
                className="group p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md transition-all">
                <span className="text-2xl block mb-2">{calc.icon}</span>
                <p className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{calc.short}</p>
                <p className="text-xs text-gray-400 mt-1 mb-2 line-clamp-2">{calc.desc}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full">
                  {row ? `⭐ Used ${row.total}+ times` : '⭐ Popular'}
                </span>
              </ToolLink>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 4 · START WITH YOUR GOAL
        ══════════════════════════════════════════════ */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-5">🎯 What Do You Want To Achieve?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GOAL_CARDS.map(g => {
              const tools = g.slugs.map(getBySlug).filter((c): c is Calculator => !!c);
              const primary = tools[0];
              return (
                <Link key={g.title} href={primary ? `/tools/${primary.category}/${primary.slug}` : '/tools'}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${g.gradient} p-6 text-white hover:scale-[1.02] transition-transform shadow-sm`}>
                  <span className="text-3xl block mb-3">{g.icon}</span>
                  <p className="font-extrabold text-lg mb-3">{g.title}</p>
                  <div className="space-y-1">
                    {tools.map(t => (
                      <p key={t.slug} className="text-xs text-white/80 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-white/60 flex-shrink-0" /> {t.short}
                      </p>
                    ))}
                  </div>
                </Link>
              );
            })}

            {/* 6th card — Improve Life Balance, CTA to the Score */}
            <Link href="/score"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-950 p-6 text-white hover:scale-[1.02] transition-transform shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-3xl block mb-3">🌿</span>
                <p className="font-extrabold text-lg mb-2">Improve Life Balance</p>
                <p className="text-xs text-white/70">One score for your whole picture — health and wealth together.</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-white group-hover:translate-x-0.5 transition-transform">
                Take WellFi Score →
              </span>
            </Link>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 5 · WELLFILAB SCORE
        ══════════════════════════════════════════════ */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-teal-950">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative p-10 md:p-14 text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-4">Beyond a single number</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 text-balance">
              Your calculators are only part of the picture.
            </h2>
            <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
              Discover your Health + Wealth score and get personalised priorities — what's actually worth fixing first.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8 max-w-lg mx-auto text-left">
              {['Body Health', 'Nutrition', 'Mental Wellness', 'Savings', 'Debt', 'Financial Future'].map(f => (
                <p key={f} className="text-xs text-gray-300 flex items-center gap-1.5">
                  <span className="text-teal-400">✓</span> {f}
                </p>
              ))}
            </div>
            <Link href="/score"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm transition-all">
              Get My Score →
            </Link>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 6 · RECOMMENDED JOURNEYS
        ══════════════════════════════════════════════ */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-5">🧭 Popular Journeys</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {JOURNEYS.map(j => {
              const tools = j.slugs.map(getBySlug).filter((c): c is Calculator => !!c);
              return (
                <div key={j.title} className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <p className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                    <span className="text-xl">{j.icon}</span> {j.title}
                  </p>
                  <div className="space-y-2">
                    {tools.map((t, i) => (
                      <Link key={t.slug} href={`/tools/${t.category}/${t.slug}`}
                        className="flex items-center gap-3 group">
                        <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white bg-gray-300 dark:bg-gray-700 group-hover:bg-teal-500 transition-colors">{i + 1}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:underline transition-colors">{t.short}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 7 · NEW TOOLS — genuinely the most recently added
            (checked against git history), no fabricated "added on" date
        ══════════════════════════════════════════════ */}
        {newTools.length > 0 && (
          <section>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-5">🆕 New Tools</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {newTools.map(c => (
                <ToolLink key={c.slug} c={c}
                  className="group p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{c.icon}</span>
                    <span className="text-[10px] font-bold text-white bg-teal-600 px-2 py-1 rounded-full">NEW</span>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{c.short}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.desc}</p>
                </ToolLink>
              ))}
            </div>
          </section>
        )}

        {!q && (
          <div>
            <ScoreCTA />
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SECTION 8 · TOOLS DIRECTORY
        ══════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Browse All Tools</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-1.5">
                {[
                  { id: 'all', label: `All (${CALCULATORS.length})` },
                  { id: 'health', label: `Health (${hCount})` },
                  { id: 'finance', label: `Finance (${fCount})` },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      tab === t.id
                        ? 'bg-teal-600 text-white border-transparent'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-teal-500">
                <option value="popular">Sort: Popular first</option>
                <option value="alpha">Sort: A–Z</option>
              </select>
            </div>
          </div>

          {sort === 'alpha' ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
              {directoryList.map(c => (
                <ToolLink key={c.slug} c={c}
                  className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-800 hover:bg-teal-50/30 dark:hover:bg-teal-950/10 transition-all group">
                  <span className="text-lg flex-shrink-0 mt-0.5">{c.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">{c.short}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{c.desc}</p>
                  </div>
                </ToolLink>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {(tab === 'all' || tab === 'health') && Object.entries(hGroups).map(([group, calcs]) => (
                <div key={group}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{GROUP_ICON[group] ?? '📂'}</span>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{group}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                    {calcs.map(c => (
                      <ToolLink key={c.slug} c={c}
                        className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-800 hover:bg-teal-50/30 dark:hover:bg-teal-950/10 transition-all group">
                        <span className="text-lg flex-shrink-0 mt-0.5">{c.icon}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">{c.short}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{c.desc}</p>
                        </div>
                      </ToolLink>
                    ))}
                  </div>
                </div>
              ))}
              {(tab === 'all' || tab === 'finance') && Object.entries(fGroups).map(([group, calcs]) => (
                <div key={group}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{GROUP_ICON[group] ?? '📂'}</span>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{group}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                    {calcs.map(c => (
                      <ToolLink key={c.slug} c={c}
                        className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800 hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition-all group">
                        <span className="text-lg flex-shrink-0 mt-0.5">{c.icon}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors truncate">{c.short}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{c.desc}</p>
                        </div>
                      </ToolLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
