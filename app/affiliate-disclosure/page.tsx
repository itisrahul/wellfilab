import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  title: `Affiliate Disclosure | ${SITE_NAME}`,
  description: 'How WellFiLab makes money from links to real providers, and what that does and does not affect.',
  alternates: { canonical: `${SITE_URL}/affiliate-disclosure` },
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Affiliate Disclosure</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Plain, in one place, instead of buried in fine print.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        <p>WellFiLab is free to use. Every calculator, the WellFiLab Score, your Goals, Roadmap, and Dashboard — none of that is paywalled, and we don't sell your data.</p>

        <p>Some pages — your Roadmap's recommended actions, and the Comparisons/Best Picks articles under <Link href="/learn/best" className="underline hover:text-teal-600 dark:hover:text-teal-400">Learn</Link> — link to real third-party providers (brokers, insurers, banks). If you sign up through one of those links, we may earn a commission, at no extra cost to you.</p>

        <h2 className="text-base font-bold text-gray-900 dark:text-white pt-2">What this does not affect</h2>
        <ul className="space-y-1.5 pl-1">
          <li>• <strong>Which providers appear.</strong> We list providers because they're genuinely relevant to the goal or calculator you're looking at — not because they pay the most.</li>
          <li>• <strong>Star ratings.</strong> See our <Link href="/learn/best/methodology" className="underline hover:text-teal-600 dark:hover:text-teal-400">rating methodology</Link> — the same 3-axis rubric applies to every provider on a page, commission or not.</li>
          <li>• <strong>Your WellFiLab Score, Roadmap, or Goal progress.</strong> That math runs entirely on your own numbers and never factors in affiliate relationships.</li>
        </ul>

        <h2 className="text-base font-bold text-gray-900 dark:text-white pt-2">What it does fund</h2>
        <p>Keeping the calculators, the Score, and the guides free and ad-free for everyone, including people who never click an affiliate link.</p>

        <h2 className="text-base font-bold text-gray-900 dark:text-white pt-2">Not financial advice</h2>
        <p>Nothing on this site, affiliate link or not, is personalized financial, legal, or tax advice. Verify current pricing and terms on a provider's own site before acting, and consult a licensed professional for advice specific to your situation.</p>
      </div>
    </div>
  );
}
