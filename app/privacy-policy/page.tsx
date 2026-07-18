import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Privacy Policy — WellFiLab' };
export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Privacy Policy</h1>
      <div className="article-body font-reading">
        <p>WellFiLab collects your email address when you subscribe to a paid plan. The WellFiLab Score never requires an email or account — used without signing in, your answers, score history, goals, and net worth history are stored only in your browser, on your device. If you sign in, that same data is also saved to our database, scoped to your account, so it's available on any device you sign into — and we also store the basic account details (name, email) your sign-in provider gives us.</p>
        <p>We use any email collected to deliver your plan and send occasional relevant updates. We never sell your data.</p>
        <p>Payments are processed by Razorpay. We do not store card details. See <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">Razorpay&apos;s Privacy Policy</a>.</p>
        <p>We use standard web analytics (page views only) to understand which articles are most useful. No personally identifiable information is collected from non-subscribers.</p>
        <p>Last updated: {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}