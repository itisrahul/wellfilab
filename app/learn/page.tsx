import type { Metadata } from 'next';
import Link from 'next/link';
import { ALL_POSTS, getByCategory } from '@/lib/posts';
import type { PostCategory } from '@/lib/types';
import { COMPARISONS } from '@/lib/comparisons';
import { ComparisonTeaserCard } from '@/components/learn/ComparisonTeaserCard';
import { PostCard } from '@/components/ui/PostCard';
import { SITE_NAME, SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  title: `Learn: guides, comparisons, and best picks | ${SITE_NAME}`,
  description: 'The math behind every calculator, explained — plus honest, rated comparisons of the real providers behind your goals.',
  alternates: { canonical: `${SITE_URL}/learn` },
};

const SECTIONS = [
  { href: '/learn/paths', icon: '🧭', label: 'Learning Paths', count: null, desc: 'Guided, step-by-step sequences through a topic.' },
  { href: '/guides', icon: '📖', label: 'Guides', count: ALL_POSTS.length, desc: 'The formula behind every calculator, sourced.' },
  { href: '/learn/best', icon: '🏆', label: 'Comparisons & Best Picks', count: COMPARISONS.length, desc: 'Rated providers, side by side, on a published rubric.' },
  { href: '/learn/reviews', icon: '🔍', label: 'Reviews', count: null, desc: 'Full single-provider deep dives.' },
] as const;

const GUIDE_CATS: { slug: PostCategory; label: string; icon: string; accent: string }[] = [
  { slug: 'health',    label: 'Health',    icon: '💪', accent: 'text-teal-700 dark:text-teal-400' },
  { slug: 'finance',   label: 'Finance',   icon: '💰', accent: 'text-amber-700 dark:text-amber-400' },
  { slug: 'nutrition', label: 'Nutrition', icon: '🥗', accent: 'text-green-700 dark:text-green-400' },
  { slug: 'lifestyle', label: 'Lifestyle', icon: '🌿', accent: 'text-purple-700 dark:text-purple-400' },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="bg-gradient-to-b from-teal-50/50 to-white dark:from-teal-950/10 dark:to-gray-950 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Learn</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Understand the math, then the providers</h1>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-2.5 max-w-xl">Every calculator has a matching guide. Where your roadmap points you at a real provider — a broker, an insurer, a bank — the comparisons here explain the real tradeoffs, not just a logo and a link.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-14">

        {/* 4 ways to learn — the whole section at a glance */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {SECTIONS.map(s => (
            <Link key={s.href} href={s.href}
              className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-800 hover:-translate-y-0.5 transition-all">
              <span className="text-2xl">{s.icon}</span>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm mt-2.5">{s.label}</h2>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{s.desc}</p>
              {s.count != null && <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400 mt-2">{s.count} live →</p>}
            </Link>
          ))}
        </section>

        {/* Guides, by category */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Guides, by category</h2>
            <Link href="/guides" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">All {ALL_POSTS.length} →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {GUIDE_CATS.map(c => {
              const posts = getByCategory(c.slug);
              return (
                <Link key={c.slug} href={`/guides?category=${c.slug}`}
                  className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                  <span className="text-xl">{c.icon}</span>
                  <p className={`font-bold text-sm mt-2 ${c.accent}`}>{c.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{posts.length} guide{posts.length === 1 ? '' : 's'}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Comparisons & Best Picks */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Comparisons & Best Picks</h2>
            <Link href="/learn/best" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">All comparisons →</Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Goal-driven, not generic — every provider rated on a <Link href="/learn/best/methodology" className="underline hover:text-amber-600 dark:hover:text-amber-400">published 3-axis rubric</Link>, with a real reason it's listed.</p>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {COMPARISONS.map(c => <ComparisonTeaserCard key={c.slug} post={c} />)}
          </div>
        </section>

        {/* Latest guides preview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Latest</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {[...ALL_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 2).map(p => <PostCard key={p.slug} post={p} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
