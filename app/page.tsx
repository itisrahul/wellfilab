import type { Metadata } from 'next';
import Link from 'next/link';
import { CALCULATORS } from '@/config/tools';
import { ALL_POSTS } from '@/lib/posts';
import { PostCard } from '@/components/ui/PostCard';
import { NewsletterSignup } from '@/components/ui/NewsletterSignup';
import { LiveCalcHero } from '@/components/home/LiveCalcHero';
import { calcBMI, calcCalories, calcBedtime, calcBodyFat, calcSIP, calcLoan, calcFIRE, calcRetirement } from '@/lib/calc';
import { fmtINR } from '@/lib/roadmapActions';
import { CountUp } from '@/components/home/CountUp';
import { Reveal } from '@/components/home/Reveal';
import { ProductTour } from '@/components/home/ProductTour';
import { FeatureGrid } from '@/components/home/FeatureGrid';
import { SITE_NAME, SITE_URL, PLANS_ENABLED } from '@/config/site';

export const metadata: Metadata = {
  title: `${SITE_NAME}: health and finance calculators`,
  description: `${CALCULATORS.length}+ calculators for health and finance, plus one score that tracks both. No signup needed — type your numbers and see results instantly.`,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: `${SITE_NAME}: health and finance calculators`,
    description: `BMI, calories, sleep, SIP, EMI, FIRE and more. Real answers, instantly.`,
    type: 'website',
  },
};

const FAQ = [
  { q: 'Is there a cost to use the calculators?', a: 'No. Every calculator and guide is open to use, with no signup. Optional paid plans exist for people who want a personal plan built from their numbers.' },
  { q: 'Do you store the numbers I type?', a: 'Calculators run in your browser and your inputs are not sent to our servers. If you sign in, your score history and goals are saved to your account so they follow you across devices.' },
  { q: 'How accurate are the results?', a: 'The math is standard and every formula is shown on each calculator page. Results are estimates: investment returns, inflation and health outcomes vary from person to person.' },
  { q: 'What is the WellFiLab Score?', a: 'An optional five-minute assessment. You enter real numbers such as sleep, weight, income and savings, and get a score with a breakdown of how it was calculated, plus a roadmap of what to fix first.' },
  { q: 'Do I need an account?', a: 'Not to use the calculators. An account adds a dashboard where your score history, goals and real holdings are saved and tracked over time.' },
];

const REASONS = [
  { icon: '🧮', title: 'Your numbers, not averages', body: 'You enter your own height, income and sleep. Results are calculated from them, and the formula is shown so you can check the work.' },
  { icon: '🧭', title: 'Every result says what to do next', body: 'A number alone does not help. Each calculator explains what yours means and links to the next sensible step.' },
  { icon: '🔗', title: 'A bigger picture, if you want it', body: 'The WellFiLab Score looks at health and money together and shows what to work on first. Skip it and just use the tools.' },
  { icon: '🔒', title: 'Private by default', body: 'Calculators run in your browser. Sign in only if you want history saved across devices.' },
];

// Sample outputs for the two-path section — real formulas (lib/calc.ts) run
// against one representative set of inputs, the same way LiveCalcHero does.
// Illustrative, not a claim about the visitor.
const bmiEx = calcBMI(68, 170);
const caloriesEx = calcCalories(68, 170, 30, 'male', 'moderate', 'maintain');
const sleepEx = calcBedtime('06:30')[0];
const bodyFatEx = calcBodyFat(68, 170, 80, 36, 'male');
const sipEx = calcSIP(6500, 12, 20, 0, 0);
const loanEx = calcLoan(2500000, 8.5, 240);
const fireEx = calcFIRE(600000, 500000, 15000, 10);
const retirementEx = calcRetirement(30, 60, 40000, 6, 10, 85);

const HEALTH_PREVIEW = [
  { label: 'BMI', value: bmiEx.bmi.toFixed(1) },
  { label: 'Calories', value: caloriesEx.target.toLocaleString('en-IN') },
  { label: 'Sleep', value: `${sleepEx.hours}h` },
  { label: 'Body fat', value: `${bodyFatEx.pct}%` },
];
const FINANCE_PREVIEW = [
  { label: 'SIP, 20yr', value: fmtINR(sipEx.maturity) },
  { label: 'EMI', value: fmtINR(loanEx.emi) },
  { label: 'FIRE number', value: fmtINR(fireEx.fireNum) },
  { label: 'Retirement corpus', value: fmtINR(retirementEx.corpus) },
];
const STATS = [
  { value: CALCULATORS.length, suffix: '+', label: 'calculators' },
  { value: ALL_POSTS.length, suffix: '', label: 'step-by-step guides' },
  { value: 0, suffix: '', label: 'accounts needed to calculate' },
  { label: 'results', word: 'Instant' },
] as const;

export default function HomePage() {
  const latest = [...ALL_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

  return (
    <div className="bg-white dark:bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }) }} />

      {/* ══════════════════════════════════════════════
          HERO — a soft two-tone wash (teal/amber, the site's own two
          categories) instead of a flat white field, no blur or glass —
          just color. Text left, the real interactive calculator right.
      ══════════════════════════════════════════════ */}
      <section className="hero-gradient relative overflow-hidden bg-gradient-to-br from-teal-50/80 via-white to-amber-50/50 dark:from-teal-950/25 dark:via-gray-950 dark:to-amber-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-24">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-14 lg:gap-16 items-center">
            <Reveal>
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-teal-700 dark:text-teal-400 mb-5">
                Health + finance, one place
              </p>
              <h1 className="text-[2.75rem] sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1] text-balance">
                Real numbers for your health and your money.
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mt-6 mb-8 max-w-lg">
                {CALCULATORS.length}+ calculators — BMI, sleep, SIP, EMI, FIRE and more — plus one score, a roadmap, and goals that track themselves. Type your numbers, get a real answer, and know what to do next.
              </p>
              <div className="flex flex-wrap items-center gap-x-7 gap-y-3 mb-9">
                <Link href="/tools/health" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-[#04211E] font-semibold text-[15px] transition-colors">
                  Browse health tools
                </Link>
                <Link href="/tools/finance" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-[#2B1600] font-semibold text-[15px] transition-colors">
                  Browse finance tools
                </Link>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No signup · Runs in your browser · Private by default
              </p>
            </Reveal>

            <Reveal delayMs={120}>
              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.15)] dark:shadow-none">
                <LiveCalcHero />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS — a plain divided row.
      ══════════════════════════════════════════════ */}
      <section className="border-y border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200 dark:divide-gray-800">
          {STATS.map(s => (
            <div key={s.label} className="py-7 px-4 sm:px-6 text-center sm:text-left">
              <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-none">
                {'word' in s ? s.word : <><CountUp value={s.value} />{s.suffix}</>}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURE GRID — every real feature, calculators included, each
          with a live scroll-triggered demo instead of a stock icon. The
          "what do I actually get" section, right up top where it's seen
          first — not a dashboard-only preview buried further down.
      ══════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal as="section" className="py-20">
          <div className="max-w-xl mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Everything you actually get</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2.5">Not just a calculator directory — a real score, a real plan, and goals that track themselves.</p>
          </div>
          <FeatureGrid healthPreview={HEALTH_PREVIEW} financePreview={FINANCE_PREVIEW} guideCount={ALL_POSTS.length} />
        </Reveal>
      </div>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="max-w-xl mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">See the whole loop in 15 seconds</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2.5">Watch it play, or tap a step below to jump straight to it.</p>
          </Reveal>
          <Reveal delayMs={100} className="max-w-3xl mx-auto">
            <ProductTour />
          </Reveal>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ══════════════════════════════════════════════
            WHY WELLFILAB
        ══════════════════════════════════════════════ */}
        <Reveal as="section" className="py-20">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">Built different from day one</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {REASONS.map(r => (
              <div key={r.title} className="flex gap-4 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                <span className="text-2xl flex-shrink-0">{r.icon}</span>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{r.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ══════════════════════════════════════════════
            GUIDES
        ══════════════════════════════════════════════ */}
        <Reveal as="section" className="py-20 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-xl mb-9">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Learn while you calculate</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2.5">Each calculator has matching guides that explain the math and what to do with your result.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {latest.map(p => <PostCard key={p.slug} post={p} />)}
          </div>
          <Link href="/guides" className="inline-flex items-center gap-2 px-5 py-2.5 mt-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 text-gray-800 dark:text-gray-200 font-semibold text-sm transition-colors">
            Read all {ALL_POSTS.length} guides
          </Link>
        </Reveal>

        {/* ══════════════════════════════════════════════
            PLANS BAND
        ══════════════════════════════════════════════ */}
        {PLANS_ENABLED && (
          <Reveal as="section" className="pb-14">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-8 flex flex-wrap justify-between items-center gap-6">
              <div className="max-w-xl">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">Want a person to look at your numbers?</h2>
                <p className="text-gray-600 dark:text-gray-400 text-[15px]">Personal diet and finance plans start at ₹149 a month. Everything else on this site stays open to use.</p>
              </div>
              <Link href="/plan" className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 text-gray-800 dark:text-gray-200 font-semibold text-sm transition-colors">
                See plans
              </Link>
            </div>
          </Reveal>
        )}

        {/* ══════════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════════ */}
        <Reveal as="section" className="py-20 border-t border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">Questions people ask</h2>
          <div className="max-w-2xl">
            {FAQ.map((item, i) => (
              <details key={i} className="group border-b border-gray-100 dark:border-gray-800 py-4">
                <summary className="flex items-center justify-between gap-4 font-semibold text-[16px] text-gray-900 dark:text-white cursor-pointer list-none">
                  {item.q}
                  <span className="text-gray-400 text-xl font-light group-open:rotate-45 transition-transform flex-shrink-0">+</span>
                </summary>
                <p className="text-gray-600 dark:text-gray-400 mt-2.5 text-[15px] leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </Reveal>

        {/* ══════════════════════════════════════════════
            NEWSLETTER
        ══════════════════════════════════════════════ */}
        <Reveal as="section" className="pb-20">
          <NewsletterSignup source="homepage" />
        </Reveal>
      </div>
    </div>
  );
}
