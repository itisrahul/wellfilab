'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ALL_POSTS } from '@/lib/posts';
import { PostCard } from '@/components/ui/PostCard';
import { ScoreCTA } from '@/components/ui/ScoreCTA';
import type { PostCategory } from '@/lib/types';

const CATS = [
  { slug:'health'    as PostCategory, label:'Health',    icon:'💪', active:'bg-teal-600',   text:'text-teal-700 dark:text-teal-300',   border:'border-teal-200 dark:border-teal-700',   bg:'bg-teal-50 dark:bg-teal-950/30'   },
  { slug:'finance'   as PostCategory, label:'Finance',   icon:'💰', active:'bg-amber-500',  text:'text-amber-700 dark:text-amber-300',  border:'border-amber-200 dark:border-amber-700',  bg:'bg-amber-50 dark:bg-amber-950/30'  },
  { slug:'nutrition' as PostCategory, label:'Nutrition', icon:'🥗', active:'bg-green-600',  text:'text-green-700 dark:text-green-300',  border:'border-green-200 dark:border-green-700',  bg:'bg-green-50 dark:bg-green-950/30'  },
  { slug:'lifestyle' as PostCategory, label:'Lifestyle', icon:'🌿', active:'bg-purple-600', text:'text-purple-700 dark:text-purple-300', border:'border-purple-200 dark:border-purple-700', bg:'bg-purple-50 dark:bg-purple-950/30' },
] as const;

const PER_PAGE = 12;

export default function GuidesPage() {
  const [cat,  setCat]  = useState<PostCategory | 'all'>('all');
  const [q,    setQ]    = useState('');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() =>
    [...ALL_POSTS].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  []);

  const filtered = useMemo(() => {
    let list = cat === 'all' ? sorted : sorted.filter(p => p.category === cat);
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(t) ||
        p.excerpt.toLowerCase().includes(t) ||
        (p.tags?.some(tag => tag.toLowerCase().includes(t)))
      );
    }
    return list;
  }, [sorted, cat, q]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const heroPost   = cat==='all' && !q && page===1 ? paginated[0] : null;
  const gridPosts  = heroPost ? paginated.slice(1) : paginated;
  const isFiltered = cat !== 'all' || q.trim().length > 0 || page > 1;
  const isSearching = q.trim().length > 0;

  function changeFilter(newCat: PostCategory | 'all') { setCat(newCat); setPage(1); setQ(''); }
  function changeSearch(val: string) { setQ(val); setPage(1); }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-2">Evidence-Based Guides</p>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Guides</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filtered.length} article{filtered.length !== 1 ? 's' : ''} · every claim sourced · no fluff
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="search" value={q} onChange={e => changeSearch(e.target.value)}
              placeholder="Search guides by topic, keyword or tag…"
              className="w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-600 rounded-xl
                         bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100
                         placeholder-gray-400 dark:placeholder-gray-500
                         focus:outline-none focus:border-teal-500 dark:focus:border-teal-400
                         focus:bg-white dark:focus:bg-gray-700 transition-all"
            />
            {q && (
              <button onClick={() => changeSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button onClick={() => changeFilter('all')}
              className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                cat === 'all' && !isSearching
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}>
              All ({ALL_POSTS.length})
            </button>
            {CATS.map(c => {
              const count = ALL_POSTS.filter(p => p.category === c.slug).length;
              const isActive = cat === c.slug && !isSearching;
              return (
                <button key={c.slug} onClick={() => changeFilter(c.slug)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                    isActive
                      ? `${c.active} text-white border-transparent`
                      : `bg-white dark:bg-gray-800 ${c.text} ${c.border} hover:shadow-sm`
                  }`}>
                  {c.icon} {c.label}
                  <span className={`text-xs ${isActive ? 'opacity-70' : 'opacity-50'}`}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {!isSearching && (
          <div className="mb-8">
            <ScoreCTA />
          </div>
        )}

        {/* Search results */}
        {isSearching ? (
          <section>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {filtered.length > 0 ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${q}"` : `No guides matched "${q}"`}
            </p>
            {filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map(p => <PostCard key={p.slug} post={p} />)}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-3xl mb-3">📭</p>
                <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1">No guides found</p>
                <p className="text-sm text-gray-400 mb-4">Try "BMI", "SIP", "sleep" or "budget"</p>
                <button onClick={() => setQ('')} className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline">Clear search</button>
              </div>
            )}
          </section>
        ) : (
          <div className="space-y-10">

            {/* Hero post */}
            {heroPost && (
              <Link href={`/guides/${heroPost.slug}`}
                className="group flex flex-col md:flex-row gap-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-700 hover:shadow-lg transition-all overflow-hidden p-6 md:p-8">
                <div className="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-5xl flex-shrink-0">
                  {heroPost.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full text-white ${CATS.find(c=>c.slug===heroPost.category)?.active ?? 'bg-gray-500'}`}>
                      {heroPost.tag}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{heroPost.readTime} min read</span>
                    <span className="ml-auto text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-full">Latest</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors leading-snug mb-3">
                    {heroPost.title}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{heroPost.excerpt}</p>
                </div>
              </Link>
            )}

            {/* All categories grouped — default view */}
            {cat === 'all' && page === 1 && (
              <div className="space-y-12">
                {CATS.map(c => {
                  const catPosts = gridPosts.filter(p => p.category === c.slug);
                  if (!catPosts.length) return null;
                  return (
                    <section key={c.slug}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg ${c.active} flex items-center justify-center text-sm text-white`}>{c.icon}</div>
                          <h2 className={`font-bold text-base ${c.text}`}>{c.label}</h2>
                          <span className="text-xs text-gray-400 dark:text-gray-500">({ALL_POSTS.filter(p=>p.category===c.slug).length})</span>
                        </div>
                        <button onClick={() => changeFilter(c.slug)} className={`text-xs font-semibold hover:underline ${c.text}`}>
                          All {c.label} →
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {catPosts.slice(0,3).map(p => <PostCard key={p.slug} post={p} />)}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            {/* Filtered / paginated view */}
            {isFiltered && !isSearching && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {filtered.length > PER_PAGE
                      ? `Showing ${(page-1)*PER_PAGE+1}–${Math.min(page*PER_PAGE, filtered.length)} of ${filtered.length}`
                      : `${filtered.length} guide${filtered.length!==1?'s':''}`}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {gridPosts.map(p => <PostCard key={p.slug} post={p} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {page > 1 && (
                      <button onClick={() => { setPage(p=>p-1); window.scrollTo({top:0,behavior:'smooth'}); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-teal-400 dark:hover:border-teal-600 transition-all">
                        ← Previous
                      </button>
                    )}
                    <div className="flex items-center gap-1">
                      {Array.from({length: Math.min(totalPages, 7)}, (_, i) => {
                        const p2 = totalPages <= 7 ? i+1 : page <= 4 ? i+1 : page >= totalPages-3 ? totalPages-6+i : page-3+i;
                        return (
                          <button key={p2} onClick={() => { setPage(p2); window.scrollTo({top:0,behavior:'smooth'}); }}
                            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${p2===page ? 'bg-teal-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                            {p2}
                          </button>
                        );
                      })}
                    </div>
                    {page < totalPages && (
                      <button onClick={() => { setPage(p=>p+1); window.scrollTo({top:0,behavior:'smooth'}); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-teal-400 dark:hover:border-teal-600 transition-all">
                        Next →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Category overview cards */}
            {!isFiltered && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                {CATS.map(c => {
                  const count = ALL_POSTS.filter(p=>p.category===c.slug).length;
                  const latest = ALL_POSTS.filter(p=>p.category===c.slug)
                    .sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime())
                    .slice(0,2);
                  return (
                    <button key={c.slug} onClick={() => changeFilter(c.slug)}
                      className={`flex flex-col p-5 rounded-2xl border-2 ${c.border} ${c.bg} hover:shadow-md transition-all text-left group`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{c.icon}</span>
                        <span className={`text-[10px] font-bold ${c.text} opacity-60`}>{count} articles</span>
                      </div>
                      <p className={`font-bold text-base ${c.text} mb-2`}>{c.label}</p>
                      <div className="space-y-1.5 mb-3">
                        {latest.map(p => (
                          <p key={p.slug} className="text-xs text-gray-500 dark:text-gray-400 truncate">· {p.title}</p>
                        ))}
                      </div>
                      <p className={`text-xs font-semibold ${c.text} group-hover:underline mt-auto`}>Browse all →</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
