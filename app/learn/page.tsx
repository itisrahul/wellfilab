import type { Metadata } from 'next';
import Link from 'next/link';
import { ALL_POSTS } from '@/lib/posts';
import { COMPARISONS } from '@/lib/comparisons';
import { ComparisonTeaserCard } from '@/components/learn/ComparisonTeaserCard';
import { PostCard } from '@/components/ui/PostCard';
import { SITE_NAME, SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  title: `Learn: guides, comparisons, and best picks | ${SITE_NAME}`,
  description: 'The math behind every calculator, explained — plus honest comparisons of the real providers behind your goals.',
  alternates: { canonical: `${SITE_URL}/learn` },
};

/**
 * The Learn hub — Guides (existing, large) and Comparisons/Best Picks
 * (new, starting with one real page) live under one roof here. Learning
 * Paths and standalone Reviews aren't listed yet — building those as
 * empty/placeholder sections would promise content that doesn't exist;
 * they'll appear here once there's something real to show.
 */
export default function LearnPage() {
  const latestGuides = [...ALL_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 2);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="bg-gradient-to-b from-teal-50/50 to-white dark:from-teal-950/10 dark:to-gray-950 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Learn</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Understand the math, then the providers</h1>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-2.5 max-w-xl">Every calculator has a matching guide. Where your roadmap points you at a real provider — a broker, an insurer, a bank — the comparisons below explain the real tradeoffs, not just a logo and a link.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><span className="text-xl">📖</span> Guides</h2>
            <Link href="/guides" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">All {ALL_POSTS.length} guides →</Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The formula behind every calculator, and the reasoning behind every roadmap action — sourced, not vibes.</p>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {latestGuides.map(p => <PostCard key={p.slug} post={p} />)}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><span className="text-xl">🏆</span> Comparisons & Best Picks</h2>
            <Link href="/learn/best" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">All comparisons →</Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Goal-driven, not generic — rated on a <Link href="/learn/best/methodology" className="underline hover:text-amber-600 dark:hover:text-amber-400">published rubric</Link>, every provider's reason for being listed spelled out.</p>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {COMPARISONS.map(c => <ComparisonTeaserCard key={c.slug} post={c} />)}
          </div>
        </section>

        <section className="p-5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Learning Paths & Reviews</h2>
          <p className="text-xs text-gray-400">Structured lesson sequences and single-provider deep reviews aren't live yet — this section grows as real content is written, not placeholder pages.</p>
        </section>
      </div>
    </div>
  );
}
