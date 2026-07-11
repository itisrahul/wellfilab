'use client';
import { useState } from 'react';
import Link from 'next/link';
import { getActivePlans, PLANS } from '@/lib/plans';

const plans = PLANS.filter(p => p.enabled);

const CARD_BORDER: Record<string, string> = {
  health:  'border-teal-200 dark:border-teal-800',
  finance: 'border-amber-200 dark:border-amber-800',
  bundle:  'border-purple-200 dark:border-purple-800',
};
const GRADIENT: Record<string, string> = {
  health:  'from-teal-500 to-emerald-500',
  finance: 'from-amber-500 to-orange-500',
  bundle:  'from-purple-500 to-pink-500',
};
const BADGE_BG: Record<string, string> = {
  health:  'bg-teal-500',
  finance: 'bg-amber-500',
  bundle:  'bg-purple-500',
};

export default function PlansPage() {
  const [billing, setBilling] = useState<'monthly'|'yearly'>('monthly');
  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-200 mb-3">Personalised Plans</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">Plans built around<br/>your goals</h1>
          <p className="text-teal-100 text-lg mb-6 max-w-xl mx-auto leading-relaxed">
            Expert-crafted diet and finance plans. <strong>No account needed to browse.</strong> 
            You only sign up when you choose to subscribe.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            {['No forced signup','Cancel anytime','7-day free trial','30-day money-back'].map(f=>(
              <span key={f} className="flex items-center gap-1.5"><span className="text-green-300">✓</span>{f}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={`text-sm font-semibold ${billing==='monthly'?'text-gray-900 dark:text-gray-100':'text-gray-400'}`}>Monthly</span>
          <button onClick={()=>setBilling(b=>b==='monthly'?'yearly':'monthly')}
            className={`relative w-12 h-6 rounded-full transition-colors ${billing==='yearly'?'bg-teal-500':'bg-gray-300 dark:bg-gray-600'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${billing==='yearly'?'translate-x-7':'translate-x-1'}`}/>
          </button>
          <span className={`text-sm font-semibold ${billing==='yearly'?'text-gray-900 dark:text-gray-100':'text-gray-400'}`}>
            Yearly <span className="text-teal-600 text-xs font-bold ml-1">Save ~22%</span>
          </span>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map(plan=>{
            const price = billing==='monthly'?plan.monthlyPrice:plan.yearlyPrice;
            return (
              <div key={plan.id} className={`relative bg-white dark:bg-gray-900 rounded-2xl border-2 ${CARD_BORDER[plan.category]} overflow-hidden flex flex-col ${plan.highlight?'shadow-xl md:scale-105':''}`}>
                {plan.highlight&&<div className={`absolute top-4 right-4 text-xs font-bold text-white px-2.5 py-1 rounded-full ${BADGE_BG[plan.category]}`}>{plan.highlight}</div>}
                <div className={`bg-gradient-to-br ${GRADIENT[plan.category]} p-6 text-white`}>
                  <div className="text-4xl mb-3">{plan.icon}</div>
                  <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{plan.tagline}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">${price}</span>
                    <span className="text-white/70">/month</span>
                  </div>
                  {billing==='monthly'&&<p className="text-xs text-white/60 mt-1">or ${plan.yearlyPrice}/mo billed yearly</p>}
                  {billing==='yearly'&&<p className="text-xs text-white/60 mt-1">Save ${(plan.monthlyPrice-plan.yearlyPrice)*12}/year</p>}
                </div>
                <div className="p-6 flex-1">
                  <ul className="space-y-2.5 mb-5">
                    {plan.features.map((f,i)=>(
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-teal-500 mt-0.5 flex-shrink-0 font-bold">✓</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">What you receive:</p>
                    {plan.deliverables.map((d,i)=>(
                      <p key={i} className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-start gap-1.5">
                        <span className="text-orange-400 mt-0.5 flex-shrink-0">→</span>{d}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <Link href={`/plans/${plan.id}?billing=${billing}`}
                    className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${GRADIENT[plan.category]} hover:opacity-90 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-sm hover:shadow-md`}>
                    Start 7-day free trial →
                  </Link>
                  <p className="text-xs text-gray-400 text-center mt-2">No card required · Cancel anytime</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8">Common questions</h2>
          <div className="space-y-3">
            {[
              {q:'Do I need an account to view plans?',a:'No. Browse everything freely. You only provide your email when you choose to subscribe.'},
              {q:'How is my plan delivered?',a:'Within 48 hours of subscribing you receive a tailored plan by email. Monthly subscribers get updated plans and check-ins every month.'},
              {q:'Can I cancel anytime?',a:'Yes. Cancel from your dashboard or email us. No questions asked. You keep access until the end of your billing period.'},
              {q:'What happens after the 7-day trial?',a:'You are billed the amount you selected. We send a reminder 2 days before the trial ends.'},
              {q:'Is the plan actually personalised?',a:'Yes. After subscribing you complete a short questionnaire. Our experts use your goals, preferences and health data to build your plan.'},
              {q:'What if I am unhappy?',a:'30-day money-back guarantee, no questions asked.'},
            ].map((f,i)=>(
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1.5">{f.q}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center mt-12 p-8 bg-teal-50 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-800">
          <div className="text-4xl mb-3">🛡️</div>
          <h3 className="font-bold text-teal-700 dark:text-teal-400 text-lg mb-2">30-day money-back guarantee</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">Not happy in the first 30 days? Full refund — no questions asked.</p>
        </div>
      </div>
    </div>
  );
}
