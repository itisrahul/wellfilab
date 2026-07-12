import type { Metadata } from 'next';
import Link from 'next/link';
import { getPlanAny } from '@/lib/plans';

export const metadata: Metadata = { title: 'Answers Received — WellFiLab' };

const TOOLS: Record<string, { name: string; href: string }[]> = {
  diet: [
    { name: 'Calorie Calculator', href: '/tools/health/calories' },
    { name: 'BMI Calculator', href: '/tools/health/bmi' },
  ],
  finance: [
    { name: 'SIP Calculator', href: '/tools/finance/sip' },
    { name: 'Retirement Calculator', href: '/tools/finance/retirement' },
  ],
  bundle: [
    { name: 'Calorie Calculator', href: '/tools/health/calories' },
    { name: 'SIP Calculator', href: '/tools/finance/sip' },
    { name: 'Retirement Calculator', href: '/tools/finance/retirement' },
  ],
};

function nextMonday(from: Date): Date {
  const d = new Date(from);
  const day = d.getDay(); // 0 = Sunday
  const daysUntilMonday = (8 - day) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  return d;
}

function fmt(d: Date): string {
  return d.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

export default function OnboardingDonePage({
  searchParams,
}: {
  searchParams: { plan?: string; email?: string };
}) {
  const planId = searchParams.plan ?? 'diet';
  const plan   = getPlanAny(planId);
  const email  = searchParams.email ?? '';

  const today       = new Date();
  const planArrives = new Date(today); planArrives.setDate(planArrives.getDate() + 2);
  const isDiet      = planId === 'diet' || planId === 'bundle';
  const nextUpdate  = isDiet ? nextMonday(today) : (() => { const d = new Date(today); d.setDate(d.getDate() + 30); return d; })();

  const tools = TOOLS[planId] ?? TOOLS.diet;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">

        <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your answers are with us 🎉</h1>
        {plan && <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{plan.icon} {plan.name}</p>}

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6 text-left">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">What happens next:</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{fmt(today)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Answers received</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{fmt(planArrives)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Your plan arrives by email</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{fmt(nextUpdate)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{isDiet ? 'First weekly meal update' : 'First monthly finance update'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-teal-50 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-800 p-5 mb-6 text-left">
          <h3 className="font-bold text-teal-700 dark:text-teal-400 mb-3 text-sm">While you wait</h3>
          <div className="space-y-2">
            {tools.map(t => (
              <Link key={t.href} href={t.href}
                className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-900 rounded-xl border border-teal-100 dark:border-teal-900 hover:border-teal-300 dark:hover:border-teal-700 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-teal-700 dark:hover:text-teal-400">
                Try the {t.name}
                <span>→</span>
              </Link>
            ))}
          </div>
        </div>

        {email && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Check your inbox at <strong className="text-gray-700 dark:text-gray-300">{email}</strong>
          </p>
        )}
        <p className="text-xs text-gray-400 mb-8">
          Questions? Email <a href="mailto:hello@wellfilab.com" className="text-teal-600 dark:text-teal-400 underline">hello@wellfilab.com</a> — we reply within 24 hours.
        </p>

        <Link href="/dashboard"
          className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm">
          Go to dashboard →
        </Link>
      </div>
    </div>
  );
}
