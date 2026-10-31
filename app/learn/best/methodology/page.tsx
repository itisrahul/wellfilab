import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  title: `How we rate providers | ${SITE_NAME}`,
  description: 'The exact 3-axis rubric behind every star rating on a WellFiLab comparison page.',
  alternates: { canonical: `${SITE_URL}/learn/best/methodology` },
};

const AXES = [
  { label: 'Beginner-friendliness', body: 'How easy the platform is for someone opening their first account — UI simplicity, how much jargon you hit before doing the thing you came to do, and how fast account opening actually is.' },
  { label: 'Cost simplicity', body: 'How easy the real cost is to understand up front — fewer fee types, clearer pricing, and (for investing platforms) whether direct plans are the default. Not "cheapest" in isolation — a platform with more features often has more fee types for a real reason.' },
  { label: 'Feature breadth', body: 'How much the platform actually does — one account covering more of what you might eventually want (stocks and funds, not just funds) scores higher here, even where that works against it on beginner-friendliness.' },
];

export default function ComparisonMethodologyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <Link href="/learn/best" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">← Comparisons & Best Picks</Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-3">How we rate providers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Every star rating on this site is the average of 3 scored axes, each 1–5 — never a single number typed in with nothing behind it.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">The 3 axes</h2>
          <div className="space-y-5">
            {AXES.map(a => (
              <div key={a.label}>
                <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-1">{a.label}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">What this rating is NOT</h2>
          <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <li>• Not based on how much a provider pays us — see our <Link href="/affiliate-disclosure" className="underline hover:text-teal-600 dark:hover:text-teal-400">affiliate disclosure</Link>.</li>
            <li>• Not a live, auto-updating number pulled from the provider's API — each page shows when it was last checked by hand.</li>
            <li>• Not a substitute for checking current pricing and features on the provider's own site before you sign up.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Who writes these</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">The WellFiLab team, using publicly available information about each provider. Scores are editorial judgment applied consistently across every pick on a page, not an automated or crowdsourced number — exactly like most comparison content you'll find elsewhere, just with the rubric shown instead of hidden.</p>
        </section>
      </div>
    </div>
  );
}
