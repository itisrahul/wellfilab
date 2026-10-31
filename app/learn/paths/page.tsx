import type { Metadata } from 'next';
import Link from 'next/link';
import { ALL_POSTS } from '@/lib/posts';
import { PostCard } from '@/components/ui/PostCard';
import { SITE_NAME, SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  title: `Learning Paths | ${SITE_NAME}`,
  description: 'Guided, step-by-step sequences through a topic — coming soon.',
  alternates: { canonical: `${SITE_URL}/learn/paths` },
};

const PLANNED = [
  { icon: '📈', label: 'Investing, start to finish', body: 'From your first SIP to asset allocation and tax-saving.' },
  { icon: '🏖️', label: 'Financial Freedom', body: 'Net worth, the 4% rule, and a real FIRE-number plan.' },
  { icon: '🛡️', label: 'Protection first', body: 'Emergency fund, health insurance, term insurance — in the right order.' },
  { icon: '💳', label: 'Debt freedom', body: 'Avalanche vs. snowball, and a real payoff timeline.' },
];

/**
 * An honest "not live yet" page, not an empty route or a fake list of
 * lessons — says plainly what's planned and points at the real content
 * (Guides) that already exists to read in the meantime, same credibility
 * rule as the rest of the site.
 */
export default function LearningPathsPage() {
  const latest = [...ALL_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <Link href="/learn" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">← Learn</Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-3">Learning Paths</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl">Guided, ordered sequences through a topic — not just a list of articles. This section isn't live yet; here's what's planned and what to read right now instead.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">What's planned</h2>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {PLANNED.map(p => (
              <div key={p.label} className="p-5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <span className="text-2xl">{p.icon}</span>
                <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm mt-2">{p.label}</h3>
                <p className="text-xs text-gray-400 mt-1">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Read these in the meantime</h2>
          <div className="grid sm:grid-cols-3 gap-3.5">
            {latest.map(p => <PostCard key={p.slug} post={p} />)}
          </div>
          <Link href="/guides" className="inline-flex items-center gap-2 px-5 py-2.5 mt-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 text-gray-800 dark:text-gray-200 font-semibold text-sm transition-colors">
            All {ALL_POSTS.length} guides →
          </Link>
        </section>
      </div>
    </div>
  );
}
