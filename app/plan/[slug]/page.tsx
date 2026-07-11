/**
 * /plan/[slug] — Individual plan detail + checkout.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getPlan, getActivePlans } from '@/lib/plans';
import { PlanCheckout } from './PlanCheckout';

export async function generateStaticParams() {
  const plans = await getActivePlans();
  return plans.map(p => ({ slug: p.id }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const plan = getPlan(params.slug);
  if (!plan) return { title: 'Plan not found' };
  return {
    title: `${plan.name} — WellFiLab`,
    description: plan.tagline,
  };
}

export default function PlanDetailPage({ params }: { params: { slug: string } }) {
  const plan = getPlan(params.slug);

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-semibold text-lg text-gray-700 dark:text-gray-300 mb-3">Plan not found</p>
          <Link href="/plan" className="text-teal-600 text-sm font-semibold hover:underline">← View all plans</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <nav className="text-xs text-gray-400 flex items-center gap-1.5 mb-8">
          <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-200">Home</Link>
          <span>/</span>
          <Link href="/plan" className="hover:text-gray-600 dark:hover:text-gray-200">Plans</Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300 font-medium">{plan.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan details — server rendered */}
          <div>
            <div className={`bg-gradient-to-br ${plan.gradient} rounded-2xl p-7 text-white mb-6`}>
              <div className="text-5xl mb-4">{plan.icon}</div>
              <h1 className="text-2xl font-bold mb-2">{plan.name}</h1>
              <p className="text-white/80 leading-relaxed">{plan.tagline}</p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">What is included:</h3>
              <ul className="space-y-3 mb-5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-teal-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">You receive:</h4>
                {plan.deliverables.map((d, i) => (
                  <p key={i} className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-start gap-1.5">
                    <span className="text-orange-400 mt-0.5 flex-shrink-0">→</span>{d}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout form — client component wrapped in Suspense */}
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-7 flex items-center justify-center min-h-64">
              <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"/>
            </div>
          }>
            <PlanCheckout plan={plan} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
