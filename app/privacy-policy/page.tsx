import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Privacy Policy — WellFiLab' };
export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Privacy Policy</h1>
      <div className="article-body font-reading">
        <p>WellFiLab collects your email address in two situations: when you subscribe to a paid plan, and optionally after completing the Health-Wealth Score assessment, where you may choose to enter your email for a 90-day check-in reminder. The Score quiz itself never requires an email or account — entering one is always optional and happens only after you see your results.</p>
        <p>We use any email collected to deliver your plan, send the check-in reminder if you opted in, and send occasional relevant updates. We never sell your data.</p>
        <p>Payments are processed by Razorpay. We do not store card details. See <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">Razorpay&apos;s Privacy Policy</a>.</p>
        <p>We use standard web analytics (page views only) to understand which articles are most useful. No personally identifiable information is collected from non-subscribers.</p>
        <p>Last updated: {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}