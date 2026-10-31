import type { Metadata } from 'next';
import Link from 'next/link';
import { COMPARISONS } from '@/lib/comparisons';
import { ComparisonTeaserCard } from '@/components/learn/ComparisonTeaserCard';
import { SITE_NAME, SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  title: `Reviews | ${SITE_NAME}`,
  description: 'Single-provider deep reviews — coming soon.',
  alternates: { canonical: `${SITE_URL}/learn/reviews` },
};

/**
 * Same honest "not live yet" treatment as /learn/paths — a standalone
 * review is a different, deeper format than a comparison (one provider,
 * covered end to end, not three side by side), so it's listed separately
 * rather than folded into Comparisons just to look less empty.
 */
export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <Link href="/learn" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">← Learn</Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-3">Reviews</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl">A full, single-provider deep dive — pricing, what it's actually like to use, who it's wrong for — deeper than a side-by-side comparison. Not live yet.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Until then: side-by-side comparisons</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Every provider that would get a standalone review already appears in a comparison, rated on the same <Link href="/learn/best/methodology" className="underline hover:text-teal-600 dark:hover:text-teal-400">published rubric</Link>.</p>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {COMPARISONS.map(c => <ComparisonTeaserCard key={c.slug} post={c} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
