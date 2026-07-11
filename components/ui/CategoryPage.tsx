'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Post, PostCategory } from '@/lib/types';

const TAG_BG: Record<string, string> = {
  'Weight Loss':'bg-teal-500', Nutrition:'bg-green-500', Sleep:'bg-indigo-500',
  'Body & Weight':'bg-teal-600', Fitness:'bg-blue-500', Investing:'bg-amber-500',
  Retirement:'bg-orange-500', Debt:'bg-red-500', SIP:'bg-amber-500',
  FIRE:'bg-red-500', Budgeting:'bg-emerald-500', Finance:'bg-amber-500',
  Health:'bg-teal-500', Lifestyle:'bg-purple-500', Mindset:'bg-purple-600',
  Habits:'bg-violet-500', Diet:'bg-lime-600', 'Gut Health':'bg-emerald-600',
};

const PAGE_SIZE = 12;

interface Props {
  category: PostCategory;
  title: string;
  description: string;
  gradient: string;
  posts: Post[];
}

export function CategoryPage({ title, description, gradient, posts }: Props) {

  const [search,  setSearch]  = useState('');
  const [tag,     setTag]     = useState('All');
  const [page,    setPage]    = useState(1);
  const [sort,    setSort]    = useState<'newest'|'oldest'|'quickest'>('newest');

  // All unique tags in this category
  const allTags = useMemo(() => {
    const s = new Set<string>();
    posts.forEach(p => s.add(p.tag));
    return ['All', ...Array.from(s).sort()];
  }, [posts]);

  // Filter + sort
  const filtered = useMemo(() => {
    let out = posts.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
      const matchTag    = tag === 'All' || p.tag === tag;
      return matchSearch && matchTag;
    });
    if (sort === 'newest')   out = [...out].sort((a,b) => b.date.localeCompare(a.date));
    if (sort === 'oldest')   out = [...out].sort((a,b) => a.date.localeCompare(b.date));
    if (sort === 'quickest') out = [...out].sort((a,b) => a.readTime - b.readTime);
    return out;
  }, [posts, search, tag, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible    = filtered.slice(0, page * PAGE_SIZE);
  const hasMore    = page < totalPages;

  const reset = () => { setSearch(''); setTag('All'); setSort('newest'); setPage(1); };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">

      {/* Header */}
      <section className={`bg-gradient-to-br ${gradient} text-white`}>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{title}</h1>
          <p className="text-white/80 text-base max-w-lg mx-auto">{description}</p>
          <p className="mt-2 text-white/50 text-sm">{posts.length} articles</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Search + sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={`Search ${title.toLowerCase()} articles…`}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-teal-400 transition-colors"
            />
          </div>
          <select value={sort} onChange={e => { setSort(e.target.value as typeof sort); setPage(1); }}
            className="px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-teal-400 transition-colors">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="quickest">Quickest read</option>
          </select>
        </div>

        {/* Tag filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {allTags.map(t => (
            <button key={t} onClick={() => { setTag(t); setPage(1); }}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                tag === t
                  ? `${TAG_BG[t] ?? 'bg-teal-500'} text-white shadow-sm`
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-teal-400'
              }`}>
              {t}
              {t !== 'All' && (
                <span className="ml-1 opacity-60">
                  {posts.filter(p => p.tag === t).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Results count + reset */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-400">
            {filtered.length === posts.length
              ? `${posts.length} articles`
              : `${filtered.length} of ${posts.length} articles`}
          </p>
          {(search || tag !== 'All') && (
            <button onClick={reset} className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium">
              Clear filters ✕
            </button>
          )}
        </div>

        {/* Article grid */}
        {visible.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500 font-medium">No articles found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search or tag</p>
            <button onClick={reset} className="mt-4 text-sm text-teal-600 hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {visible.map(post => (
              <Link key={post.slug} href={`/guides/${post.slug}`}
                className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-teal-200 hover:shadow-sm transition-all group">
                <span className="text-2xl flex-shrink-0 mt-0.5">{post.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${TAG_BG[post.tag] ?? 'bg-gray-500'}`}>
                      {post.tag}
                    </span>
                    <span className="text-xs text-gray-400">{post.readTime} min</span>
                    <span className="text-xs text-gray-300 dark:text-gray-600">{post.date.slice(0,7)}</span>
                  </div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors leading-snug mb-1">
                    {post.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                  {post.hwtCalc && (
                    <span className="inline-flex items-center gap-1 text-[11px] mt-1.5 text-teal-600 dark:text-teal-400 font-medium">
                      🧮 {post.hwtCalc.label}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="mt-8 text-center">
            <button onClick={() => setPage(p => p + 1)}
              className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-teal-400 hover:text-teal-600 transition-all">
              Load more · {filtered.length - visible.length} remaining
            </button>
          </div>
        )}

        {/* All shown */}
        {!hasMore && visible.length > PAGE_SIZE && (
          <p className="mt-8 text-center text-xs text-gray-400">
            All {filtered.length} articles shown
          </p>
        )}
      </div>
    </div>
  );
}
