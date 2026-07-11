import type { Metadata } from 'next';
import Link from 'next/link';
import { getPlan } from '@/lib/plans';

export const metadata: Metadata = { title: 'Subscription Confirmed — WellFiLab' };

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { plan?: string; email?: string; demo?: string; session_id?: string };
}) {
  const plan    = searchParams.plan ? getPlan(searchParams.plan) : null;
  const isDemo  = searchParams.demo === 'true';
  const email   = searchParams.email ?? '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">

        {/* Success animation */}
        <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          {isDemo ? "Demo — All Set!" : "You're subscribed!"}
        </h1>

        {plan && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{plan.icon}</span>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">{plan.name}</p>
                <p className="text-sm text-teal-600 font-semibold">7-day free trial started</p>
              </div>
            </div>
            {email && <p className="text-sm text-gray-500">Confirmation sent to: <strong>{decodeURIComponent(email)}</strong></p>}
          </div>
        )}

        <div className="bg-teal-50 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-800 p-5 mb-8 text-left">
          <h3 className="font-bold text-teal-700 dark:text-teal-400 mb-3">What happens next:</h3>
          <div className="space-y-2">
            {[
              { step: '1', text: 'Check your email — onboarding questionnaire sent in 5 minutes' },
              { step: '2', text: 'Complete the questionnaire so we can personalise your plan' },
              { step: '3', text: 'Receive your custom plan within 48 hours' },
              { step: '4', text: 'Monthly updates and check-ins every 4 weeks' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{s.step}</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {isDemo && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
              🔧 Development mode — In production, Stripe handles real payments.
              Configure your STRIPE_SECRET_KEY in .env.local to enable real checkout.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"
            className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm">
            ← Back to articles
          </Link>
          <Link href="/plan"
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-6 py-3 rounded-xl hover:shadow-sm transition-all text-sm">
            View all plans
          </Link>
        </div>
      </div>
    </div>
  );
}
