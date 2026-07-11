import type { Metadata } from 'next';
import Link from 'next/link';
import { getActivePlans } from '@/lib/plans';
import { SITE_NAME, SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  title: `Personalised Plans — ${SITE_NAME}`,
  description: 'Expert-crafted health and finance plans personalised to your goals. Starts from ₹149/month. 7-day free trial. See your free Score first.',
  alternates: { canonical: `${SITE_URL}/plan` },
};

const TRUST = [
  { icon:'⭐', n:'Free Score', desc:'Start with the free Health-Wealth Score to see where you stand before choosing a plan.' },
  { icon:'👩‍⚕️', n:'Expert-built', desc:'Every plan is crafted by certified nutritionists, financial planners, and health coaches.' },
  { icon:'🎯', n:'Personalised', desc:'Tailored to your Score results, goals, income bracket, and lifestyle — not a generic template.' },
  { icon:'💬', n:'30-day guarantee', desc:'Not happy in the first 30 days? Full refund, no questions asked.' },
];

const COMPARE = [
  { feature:'Access to all 60+ calculators', free:true,  paid:true  },
  { feature:'34 evidence-based guides',       free:true,  paid:true  },
  { feature:'Health-Wealth Score',            free:true,  paid:true  },
  { feature:'90-day trend tracking',          free:true,  paid:true  },
  { feature:'Personalised action plan',       free:'Basic', paid:'Full' },
  { feature:'Custom meal / budget plan',      free:false, paid:true  },
  { feature:'Weekly expert check-ins',        free:false, paid:true  },
  { feature:'Priority email support',         free:false, paid:true  },
  { feature:'Downloadable PDF plans',         free:false, paid:true  },
];

export default async function PlanPage() {
  const plans = await getActivePlans();

  

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ── Dashboard header ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-3">
            Personalised Plans
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight">
            Go beyond the calculator.
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-xl mx-auto leading-relaxed mb-6">
            Free tools show you the numbers. Our expert-crafted plans tell you exactly what to do with them — personalised to your goals, income, and lifestyle.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/score"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-teal-600 text-teal-600 dark:text-teal-400 font-semibold text-sm hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all">
              ⭐ See your Score first (free)
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">

        {/* ── Plan cards ── */}
        <section>
          <div className="grid md:grid-cols-3 gap-5">
            {plans.map(plan => (
              <div key={plan.id}
                className={`relative flex flex-col bg-white dark:bg-gray-900 rounded-2xl border-2 overflow-hidden ${plan.borderColor}`}>

                {/* Popular badge */}
                {plan.highlight && (
                  <div className="absolute top-4 right-4">
                    <span className={`text-[10px] font-bold text-white px-2.5 py-1 rounded-full ${plan.badgeColor}`}>
                      {plan.highlight}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className={`bg-gradient-to-br ${plan.gradient} p-6 text-white`}>
                  <div className="text-3xl mb-2">{plan.icon}</div>
                  <h2 className="text-lg font-extrabold mb-0.5">{plan.name}</h2>
                  <p className="text-sm text-white/80">{plan.tagline}</p>
                </div>

                {/* Pricing */}
                <div className="px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                      ₹{plan.monthlyPrice}
                    </span>
                    <span className="text-sm text-gray-400">/month</span>
                  </div>
                  {plan.yearlyPrice && (
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-0.5">
                      ₹{plan.yearlyPrice}/yr — save ₹{(plan.monthlyPrice * 12 - plan.yearlyPrice)}
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="px-6 py-4 flex-1 space-y-2">
                  {plan.features.slice(0, 6).map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{f}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                  <Link href={`/plan/${plan.id}`}
                    className={`flex items-center justify-center w-full py-2.5 rounded-xl font-bold text-sm transition-all text-white bg-gradient-to-r ${plan.gradient} hover:shadow-lg hover:scale-[1.01]`}>
                    Get {plan.name} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Free vs Paid comparison ── */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">Free tools vs Paid plans</h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-3 border-b border-gray-100 dark:border-gray-800">
              <div className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Feature</div>
              <div className="p-4 text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Free</p>
                <p className="text-xs text-gray-400">Always available</p>
              </div>
              <div className="p-4 text-center bg-teal-50 dark:bg-teal-950/20">
                <p className="text-sm font-bold text-teal-600 dark:text-teal-400">Paid Plan</p>
                <p className="text-xs text-gray-400">From ₹149/mo</p>
              </div>
            </div>
            {COMPARE.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 border-b border-gray-50 dark:border-gray-800/50 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/20'}`}>
                <div className="p-3.5 text-sm text-gray-600 dark:text-gray-400">{row.feature}</div>
                <div className="p-3.5 flex items-center justify-center">
                  {row.free === true
                    ? <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    : row.free === false
                    ? <svg className="w-4 h-4 text-gray-300 dark:text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                    : <span className="text-xs font-semibold text-gray-500">{row.free}</span>
                  }
                </div>
                <div className="p-3.5 flex items-center justify-center bg-teal-50/50 dark:bg-teal-950/10">
                  {row.paid === true
                    ? <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    : <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">{row.paid}</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Trust signals ── */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">Why WellFiLab plans</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST.map(t => (
              <div key={t.n} className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                <div className="text-2xl mb-3">{t.icon}</div>
                <p className="font-bold text-sm text-gray-900 dark:text-white mb-1.5">{t.n}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="bg-gradient-to-br from-teal-600 to-cyan-500 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-extrabold mb-3">Not sure which plan to pick?</h2>
          <p className="text-teal-100 mb-6 text-sm max-w-md mx-auto">
            Take the free Health-Wealth Score first. It tells you exactly which areas of your life need the most attention — so you choose the right plan.
          </p>
          <Link href="/score"
            className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all text-sm">
            ⭐ Get my free Score →
          </Link>
        </section>

      </div>
    </div>
  );
}
