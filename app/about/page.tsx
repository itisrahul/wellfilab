import type { Metadata } from 'next';
import Link from 'next/link';
import { CALCULATORS } from '@/config/tools';
import { ALL_POSTS } from '@/lib/posts';
import { SITE_NAME, SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  title: `About — ${SITE_NAME}`,
  description: `WellFiLab provides ${CALCULATORS.length}+ free health and finance calculators in 15 currencies, evidence-based guides, and a personalised WellFiLab Score — for users worldwide.`,
  alternates: { canonical: `${SITE_URL}/about` },
};

const PRINCIPLES = [
  { icon:'🔒', title:'Privacy by design',     body:'Every calculation runs in your browser. We never receive, see, or store your inputs or results. There is no server-side calculation. Nothing leaves your device.' },
  { icon:'✅', title:'Verified numbers',        body:'Every formula is sourced against published research or official regulatory guidance. When the 2024 Budget changed LTCG tax from 10% to 12.5%, we updated the calculation logic — not just the text around it.' },
  { icon:'🌍', title:'Globally relevant',        body:'15 currencies supported. Content and examples cover US, UK, EU, India, Australia, UAE, Canada, and Singapore. Switch currency on any calculator with one tap.' },
  { icon:'🆓', title:'Free core, always',       body:'The calculators, guides, and Score are free and stay free. Paid plans fund the site — they are not a gate on the free tools.' },
  { icon:'📊', title:'No fabricated data',      body:'We do not invent "average user" statistics or fake benchmarks. Every number we cite comes from a named source we can link to.' },
];

const TIMELINE = [
  { year:'2023', event:'WellFiLab launched as a finance and health blog — covering FIRE, weight loss, sleep science, and personal finance for a global audience.' },
  { year:'2024', event:'Added a Score feature — a guided assessment combining health and finance, with personalised action plans and trend tracking.' },
  { year:'2024', event:'Built HealthWealthTools — 60 free calculators covering everything from BMI to tax to retirement planning, supporting 15 currencies.' },
  { year:'2025', event:'Merged both products into a single platform at wellfilab.com — one domain, one design, one place for tools and guides.' },
  { year:'2026', event:'Rebuilt the Score into the unified WellFiLab Score — 3 quick questions get you an instant score and archetype, then real numbers on your body and finances unlock the full picture: health costs in real currency, life trajectories, and a 6-dimension breakdown.' },
];

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">

      {/* ── Header ── */}
      <div className="border-b border-gray-100 dark:border-gray-800 py-14">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-4">About WellFiLab</p>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-5 leading-tight">
            We built the tools<br />we wished existed.
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            Most health sites ignore your finances. Most finance sites ignore your health.
            WellFiLab covers both — because your sleep quality affects your earning capacity, and financial stress directly impacts physical health. We built it for anyone, anywhere.
          </p>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="grid grid-cols-4 gap-6 text-center">
            {[
              { n: CALCULATORS.length + '+', l:'Free tools' },
              { n: ALL_POSTS.length,         l:'Guides' },
              { n: '6',                      l:'Score dimensions' },
              { n: '0',                      l:'Accounts needed' },
            ].map(s => (
              <div key={s.l}>
                <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mb-0.5">{s.n}</p>
                <p className="text-xs text-gray-400">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-14 space-y-14">

        {/* ── What we offer ── */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-5">What WellFiLab offers</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon:'🧮', title:`${CALCULATORS.length}+ Calculators`,      desc:'BMI, SIP, EMI, FIRE, income tax, body fat, calories, sleep cycles and more. All free, all instant, all private.' },
              { icon:'📖', title:`${ALL_POSTS.length} Evidence-Based Guides`, desc:'Health, finance, nutrition, and lifestyle — every claim is sourced against published research.' },
              { icon:'⭐', title:'WellFiLab Score',                          desc:'3 quick questions, 60 seconds, instant score and archetype. Go deeper for real numbers on health and money.' },
            ].map(f => (
              <div key={f.title} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <div className="text-2xl mb-3">{f.icon}</div>
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-2">{f.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Principles ── */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-5">Our principles</h2>
          <div className="space-y-3">
            {PRINCIPLES.map(p => (
              <div key={p.title} className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-xl flex-shrink-0 mt-0.5">{p.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">{p.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Timeline ── */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-5">How we got here</h2>
          <div className="space-y-6 relative pl-16">
            <div className="absolute left-8 top-2 bottom-2 w-px bg-gray-100 dark:bg-gray-800" />
            {TIMELINE.map((t, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-8 top-1 w-3 h-3 rounded-full bg-teal-500 border-2 border-white dark:border-gray-950" />
                <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mb-1">{t.year}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t.event}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTAs ── */}
        <section className="grid sm:grid-cols-2 gap-4">
          <Link href="/score"
            className="group flex flex-col gap-3 p-6 rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/20 hover:border-teal-300 hover:shadow-sm transition-all">
            <span className="text-2xl">⭐</span>
            <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">Try the WellFiLab Score</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Free, 3 quick questions, instant personalised results.</p>
          </Link>
          <Link href="/contact"
            className="group flex flex-col gap-3 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all">
            <span className="text-2xl">✉️</span>
            <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">Get in touch</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Errors, suggestions, or plan questions. We reply within 24 hours.</p>
          </Link>
        </section>

      </div>
    </div>
  );
}
