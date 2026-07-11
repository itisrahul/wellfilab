import type { Metadata } from 'next';
import Link from 'next/link';
import { ALL_POSTS } from '@/lib/posts';
import { PostCard } from '@/components/ui/PostCard';
import { SITE_NAME, SITE_URL } from '@/config/site';
import type { PostCategory } from '@/lib/types';

export const metadata: Metadata = {
  title: `Evidence-Based Guides — ${SITE_NAME}`,
  description: `${ALL_POSTS.length} guides on health, finance, nutrition and lifestyle. Every claim is cited. Every number is verified.`,
  alternates: { canonical: `${SITE_URL}/guides` },
};

const CATS = [
  { slug:'health'    as PostCategory, label:'Health',    icon:'💪', bg:'bg-teal-500',   ring:'ring-teal-200 dark:ring-teal-800',   text:'text-teal-700 dark:text-teal-400'   },
  { slug:'finance'   as PostCategory, label:'Finance',   icon:'💰', bg:'bg-amber-500',  ring:'ring-amber-200 dark:ring-amber-800',  text:'text-amber-700 dark:text-amber-400'  },
  { slug:'nutrition' as PostCategory, label:'Nutrition', icon:'🥗', bg:'bg-green-500',  ring:'ring-green-200 dark:ring-green-800',  text:'text-green-700 dark:text-green-400'  },
  { slug:'lifestyle' as PostCategory, label:'Lifestyle', icon:'🌿', bg:'bg-purple-500', ring:'ring-purple-200 dark:ring-purple-800', text:'text-purple-700 dark:text-purple-400' },
];

export default function BlogPage({ searchParams }: { searchParams: { category?: string } }) {
  const active = searchParams.category as PostCategory | undefined;
  const sorted = [...ALL_POSTS].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const posts  = active ? sorted.filter(p => p.category === active) : sorted;
  const featured = posts[0];
  const rest     = posts.slice(1);
  const activeCat = active ? CATS.find(c => c.slug === active) : null;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">

      {/* ── Header ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
            {activeCat ? `${activeCat.icon} ${activeCat.label} Guides` : 'Evidence-Based Guides'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {posts.length} articles · every claim sourced · India-first content
          </p>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <a href="/guides"
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                !active
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}>
              All ({ALL_POSTS.length})
            </a>
            {CATS.map(cat => {
              const count   = ALL_POSTS.filter(p => p.category === cat.slug).length;
              const isActive = active === cat.slug;
              return (
                <a key={cat.slug} href={`/guides?category=${cat.slug}`}
                  className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                    isActive
                      ? `${cat.bg} text-white border-transparent`
                      : `bg-white dark:bg-gray-800 ${cat.text} ring-1 ${cat.ring} border-transparent hover:shadow-sm`
                  }`}>
                  {cat.icon} {cat.label} ({count})
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold text-gray-600 dark:text-gray-400">No guides in this category yet.</p>
            <a href="/guides" className="mt-4 inline-block text-sm text-teal-600 dark:text-teal-400 hover:underline">View all guides</a>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Featured post — first result, larger card */}
            {featured && (
              <Link href={`/blog/${featured.slug}`}
                className="group flex flex-col md:flex-row gap-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-800 hover:shadow-md transition-all overflow-hidden p-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-gray-50 dark:bg-gray-800">
                  {featured.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                      CATS.find(c=>c.slug===featured.category)?.bg ?? 'bg-gray-500'
                    }`}>{featured.tag}</span>
                    <span className="text-xs text-gray-400">{new Date(featured.date).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</span>
                    <span className="text-xs text-gray-400">· {featured.readTime} min read</span>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 ml-auto">Latest ↑</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors leading-snug mb-2">
                    {featured.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{featured.excerpt}</p>
                  {featured.hwtCalc && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400">
                      🧮 {featured.hwtCalc.label} →
                    </div>
                  )}
                </div>
              </Link>
            )}

            {/* Rest as grid */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rest.map(p => <PostCard key={p.slug} post={p} />)}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
