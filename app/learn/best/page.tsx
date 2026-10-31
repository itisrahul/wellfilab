import type { Metadata } from 'next';
import Link from 'next/link';
import { COMPARISONS } from '@/lib/comparisons';
import { ComparisonTeaserCard } from '@/components/learn/ComparisonTeaserCard';
import { SITE_NAME, SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  title: `Best Picks & Comparisons | ${SITE_NAME}`,
  description: 'Honest, goal-driven comparisons of the real providers behind common financial and health goals.',
  alternates: { canonical: `${SITE_URL}/learn/best` },
};

export default function BestPicksIndexPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <Link href="/learn" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">← Learn</Link>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mt-3 mb-2">Comparisons & Best Picks</p>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Best Picks & Comparisons</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl">Goal-driven, not generic — each comparison exists because a real roadmap action or calculator points you here, not the other way around.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid sm:grid-cols-2 gap-3.5">
          {COMPARISONS.map(c => <ComparisonTeaserCard key={c.slug} post={c} />)}
        </div>
      </div>
    </div>
  );
}
