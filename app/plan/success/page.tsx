import type { Metadata } from 'next';
import Link from 'next/link';
import { getPlan } from '@/lib/plans';

export const metadata: Metadata = { title: 'Subscription Confirmed — WellFiLab' };

const TIMELINE = [
  { key: 'form',    label: 'Form done' },
  { key: 'plan',    label: 'Plan arrives (48hrs)' },
  { key: 'weekly',  label: 'Weekly update' },
  { key: 'review',  label: 'Monthly review' },
];

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { plan?: string; email?: string; demo?: string; session_id?: string };
}) {
  const planId  = searchParams.plan;
  const plan    = planId ? getPlan(planId) : null;
  const isDemo  = searchParams.demo === 'true';
  const email   = searchParams.email ?? '';
  const onboardingHref = `/plan/onboarding?plan=${planId ?? 'diet'}&email=${encodeURIComponent(email)}`;

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
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <span className="text-2xl">{plan.icon}</span>
            <p className="font-bold text-gray-900 dark:text-gray-100">{plan.name}</p>
          </div>
        )}

        {/* Onboarding CTA — the #1 priority on this page */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-teal-500 p-6 mb-6 text-left shadow-lg shadow-teal-600/10">
          <p className="font-bold text-gray-900 dark:text-gray-100 mb-1.5">🎯 Complete your onboarding now</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-1.5">
            This is how we personalise your plan. Without this we create a generic plan — not one built for you specifically.
          </p>
          <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-4">Takes 5 minutes.</p>
          <Link href={onboardingHref}
            className="block text-center w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all hover:scale-[1.01]">
            Fill my onboarding form →
          </Link>
        </div>

        {/* Journey timeline — "you are here" */}
        <div className="bg-teal-50 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-800 p-5 mb-8 text-left">
          <p className="text-xs font-bold text-teal-700 dark:text-teal-400 mb-4">You are here → Fill onboarding form</p>
          <div className="flex items-center justify-between">
            {TIMELINE.map((t, i) => (
              <div key={t.key} className="flex-1 flex flex-col items-center text-center relative">
                {i > 0 && <div className="absolute top-3 right-1/2 w-full h-0.5 bg-teal-200 dark:bg-teal-800 -z-0" />}
                <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1.5 ${
                  i === 0 ? 'bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-900' : 'bg-white dark:bg-gray-800 text-gray-400 border border-teal-200 dark:border-teal-800'
                }`}>{i === 0 ? '●' : i + 1}</div>
                <p className={`text-[10px] leading-tight ${i === 0 ? 'font-bold text-teal-700 dark:text-teal-400' : 'text-gray-400'}`}>{t.label}</p>
              </div>
            ))}
          </div>
        </div>

        {isDemo && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
              🔧 Development mode — In production, Razorpay handles real payments.
              Configure your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local to enable real checkout.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={onboardingHref}
            className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm">
            Fill onboarding form →
          </Link>
          <Link href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-6 py-3 rounded-xl hover:shadow-sm transition-all text-sm">
            Go to dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
