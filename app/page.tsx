import type { Metadata } from 'next';
import Link from 'next/link';
import { CALCULATORS, getBySlug } from '@/config/tools';
import { ALL_POSTS } from '@/lib/posts';
import { PostCard } from '@/components/ui/PostCard';
import { NewsletterSignup } from '@/components/ui/NewsletterSignup';
import { LiveCalcHero } from '@/components/home/LiveCalcHero';
import { calcBMI, calcCalories, calcBedtime, calcBodyFat, calcSIP, calcLoan, calcFIRE, calcRetirement } from '@/lib/calc';
import { fmtINR } from '@/lib/roadmapActions';
import { CountUp } from '@/components/home/CountUp';
import { Reveal } from '@/components/home/Reveal';
import { AnimatedRing } from '@/components/home/AnimatedRing';
import { AnimatedBar } from '@/components/home/AnimatedBar';
import { AnimatedTrendChart } from '@/components/home/AnimatedTrendChart';
import { ProductTour } from '@/components/home/ProductTour';
import { SITE_NAME, SITE_URL, PLANS_ENABLED } from '@/config/site';

export const metadata: Metadata = {
  title: `${SITE_NAME}: health and finance calculators`,
  description: `${CALCULATORS.length}+ calculators for health and finance, no signup needed. Type your numbers, see results instantly, and get a clear next step.`,
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
  { q: 'Do I need an account?', a: 'Not to use the calculators. An account adds a dashboard where your score history, goals and daily check-ins are saved.' },
];

const REASONS = [
  { title: 'Your numbers, not averages', body: 'You enter your own height, income and sleep. Results are calculated from them, and the formula is shown so you can check the work.' },
  { title: 'Every result says what to do next', body: 'A number alone does not help. Each calculator explains what yours means and links to the next sensible step.' },
  { title: 'A bigger picture, if you want it', body: 'The WellFiLab Score looks at health and money together and shows what to work on first. Skip it and just use the tools.' },
  { title: 'Private by default', body: 'Calculators run in your browser. Sign in only if you want history saved across devices.' },
];

const HEALTH_PICKS = ['bmi', 'calories', 'sleep', 'body-fat'].map(s => getBySlug(s)).filter(Boolean) as typeof CALCULATORS;
const FINANCE_PICKS = ['sip', 'loan', 'fire', 'retirement'].map(s => getBySlug(s)).filter(Boolean) as typeof CALCULATORS;

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
const MOCK_RINGS = [
  { label: 'Body', score: 82, color: '#2DD4BF', delta: '+6' },
  { label: 'Mind', score: 53, color: '#A78BFA', delta: '−2' },
  { label: 'Wealth', score: 60, color: '#F59E0B', delta: '+4' },
  { label: 'Life', score: 71, color: '#4ADE80', delta: '+3' },
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
    <div className="bg-[#0A0D0C]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }) }} />

      {/* ══════════════════════════════════════════════
          HERO — flat, centered, no glow/blur/gradient. One real
          interactive calculator below the fold line, in a plain
          thin-bordered card.
      ══════════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
        <Reveal>
          <p className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-6">
            {CALCULATORS.length}+ tools · No signup needed
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08] text-balance">
            Calculators for health and finance.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mt-5 mb-9 max-w-xl mx-auto">
            BMI, calories, sleep, SIP, EMI, FIRE and {CALCULATORS.length}+ more. Type your numbers, watch the result update, and get a clear next step.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-16">
            <Link href="/tools/health" className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-teal-500 hover:bg-teal-400 text-[#04211E] font-semibold text-sm transition-colors">
              Browse health tools
            </Link>
            <Link href="/tools/finance" className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-white/15 hover:border-white/30 text-slate-200 font-semibold text-sm transition-colors">
              Browse finance tools
            </Link>
          </div>
        </Reveal>

        <Reveal delayMs={120} className="max-w-xl mx-auto">
          <LiveCalcHero />
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════
          STATS — a plain divided row, no cards.
      ══════════════════════════════════════════════ */}
      <section className="border-y border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10">
          {STATS.map(s => (
            <div key={s.label} className="py-7 px-4 sm:px-6 text-center sm:text-left">
              <p className="text-2xl font-bold tracking-tight text-white leading-none">
                {'word' in s ? s.word : <><CountUp value={s.value} />{s.suffix}</>}
              </p>
              <p className="text-sm text-slate-500 mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* ══════════════════════════════════════════════
            TWO PATHS — flat, a left accent rule, no watermark text, no glow.
        ══════════════════════════════════════════════ */}
        <Reveal as="section" className="py-20 grid md:grid-cols-2 gap-10">
          <div className="border-l-2 border-teal-500 pl-6">
            <h3 className="text-xl font-bold text-white mb-2">Health calculators</h3>
            <p className="text-slate-400 text-[15px] leading-relaxed mb-5">BMI, calories, sleep cycles, body fat, heart rate zones, hydration — understand your body with real numbers, not guesswork.</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6 text-sm">
              {HEALTH_PREVIEW.map(p => (
                <div key={p.label} className="flex justify-between gap-2 border-b border-white/5 py-1.5">
                  <dt className="text-slate-500">{p.label}</dt>
                  <dd className="font-semibold text-slate-200 tabular-nums">{p.value}</dd>
                </div>
              ))}
            </dl>
            <Link href="/tools/health" className="text-sm font-semibold text-teal-400 hover:underline">
              Browse health tools →
            </Link>
          </div>

          <div className="border-l-2 border-amber-500 pl-6">
            <h3 className="text-xl font-bold text-white mb-2">Finance calculators</h3>
            <p className="text-slate-400 text-[15px] leading-relaxed mb-5">SIP, EMI, FIRE, retirement, income tax, compound interest — make smarter money decisions with tools built for real numbers.</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6 text-sm">
              {FINANCE_PREVIEW.map(p => (
                <div key={p.label} className="flex justify-between gap-2 border-b border-white/5 py-1.5">
                  <dt className="text-slate-500">{p.label}</dt>
                  <dd className="font-semibold text-slate-200 tabular-nums">{p.value}</dd>
                </div>
              ))}
            </dl>
            <Link href="/tools/finance" className="text-sm font-semibold text-amber-400 hover:underline">
              Browse finance tools →
            </Link>
          </div>
        </Reveal>
      </div>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section className="border-t border-white/10 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal className="max-w-xl mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-white">See the whole loop in 15 seconds</h2>
            <p className="text-slate-400 mt-2.5">Watch it play, or tap a step below to jump straight to it.</p>
          </Reveal>
          <Reveal delayMs={100} className="max-w-3xl mx-auto dark">
            <ProductTour />
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHY WELLFILAB — a plain divided list, same pattern as FAQ below.
      ══════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal as="section" className="py-20 border-t border-white/10">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-8">Built different from day one</h2>
          <div className="divide-y divide-white/10 border-t border-white/10">
            {REASONS.map(r => (
              <div key={r.title} className="grid md:grid-cols-[1fr_1.6fr] gap-2 md:gap-8 py-6">
                <h3 className="text-base font-semibold text-white">{r.title}</h3>
                <p className="text-slate-400 text-[15px]">{r.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ══════════════════════════════════════════════
          DASHBOARD PREVIEW — flat card, clearly sample data.
      ══════════════════════════════════════════════ */}
      <section className="border-y border-white/10 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-white">A dashboard you will actually open every day</h2>
            <p className="text-slate-400 mt-3 mb-6 text-[15px] leading-relaxed">Log sleep, water, movement and spending in under a minute. See your trends, tick off today's actions, and keep your goals in one place.</p>
            <ul className="grid gap-2.5 mb-7 text-[15px] text-slate-300">
              {['Daily check-in with weekly trend charts', 'Roadmap actions with estimated impact', 'Goals for weight, savings, score and more', 'Net worth tracker, ready for broker connections'].map(li => (
                <li key={li} className="flex items-start gap-2.5">
                  <span className="text-teal-400 flex-shrink-0">—</span>{li}
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-teal-500 hover:bg-teal-400 text-[#04211E] font-semibold text-sm transition-colors">
              Explore the dashboard
            </Link>
          </Reveal>

          <Reveal delayMs={150} className="bg-[#111412] border border-white/10 rounded-xl p-5 grid gap-4" aria-label="Sample dashboard preview">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Good morning, Rahul</span><span>Sample data</span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {MOCK_RINGS.map((r, i) => (
                <div key={r.label} className="text-center">
                  <div className="relative mx-auto">
                    <AnimatedRing pct={r.score} color={r.color} size={48} thick={4} delayMs={i * 180} />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{r.score}</div>
                  </div>
                  <p className="text-xs font-semibold text-white mt-1">{r.label}</p>
                  <p className={`text-xs ${r.delta.startsWith('−') ? 'text-red-400' : 'text-emerald-400'}`}>{r.delta}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-3.5">
              <div className="flex items-baseline justify-between mb-1">
                <h4 className="text-xs font-semibold text-slate-300">Score over time</h4>
                <span className="text-xs font-bold text-teal-400">+23 in 6 months</span>
              </div>
              <AnimatedTrendChart />
            </div>

            <div className="grid sm:grid-cols-2 gap-5 border-t border-white/10 pt-3.5">
              <div className="grid gap-2.5 content-start">
                <h4 className="text-xs font-semibold text-slate-300">Today</h4>
                {[
                  { label: 'Bedtime alarm set for 10:30 pm', done: true },
                  { label: 'No phone 30 minutes before bed', done: false },
                  { label: 'Raise SIP from ₹3,000 to ₹6,500', done: false },
                ].map((item, i) => (
                  <Reveal key={item.label} delayMs={300 + i * 200} className="flex gap-2 text-xs text-slate-300">
                    <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 mt-0.5 ${item.done ? 'border-teal-400 bg-teal-400' : 'border-white/20'}`} />
                    <span className={item.done ? 'line-through text-slate-500' : ''}>{item.label}</span>
                  </Reveal>
                ))}
              </div>
              <div className="grid gap-2.5 content-start">
                <h4 className="text-xs font-semibold text-slate-300">Goals</h4>
                <div className="text-xs text-slate-300">Emergency fund
                  <AnimatedBar pct={47} delayMs={400} />
                  47% of ₹1.5 lakh
                </div>
                <div className="text-xs text-slate-300">Weight 84 → 75 kg
                  <AnimatedBar pct={31} delayMs={700} />
                  31% there
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* ══════════════════════════════════════════════
            GUIDES
        ══════════════════════════════════════════════ */}
        <Reveal as="section" className="py-20">
          <div className="max-w-xl mb-9">
            <h2 className="text-2xl font-bold tracking-tight text-white">Learn while you calculate</h2>
            <p className="text-slate-400 mt-2.5">Each calculator has matching guides that explain the math and what to do with your result.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3.5 dark">
            {latest.map(p => <PostCard key={p.slug} post={p} />)}
          </div>
          <Link href="/guides" className="inline-flex items-center gap-2 px-5 py-2.5 mt-6 rounded-md border border-white/15 hover:border-white/30 text-slate-200 font-semibold text-sm transition-colors">
            Read all {ALL_POSTS.length} guides
          </Link>
        </Reveal>

        {/* ══════════════════════════════════════════════
            PLANS BAND
        ══════════════════════════════════════════════ */}
        {PLANS_ENABLED && (
          <Reveal as="section" className="pb-14">
            <div className="rounded-xl border border-white/10 p-8 flex flex-wrap justify-between items-center gap-6">
              <div className="max-w-xl">
                <h2 className="text-lg font-bold text-white mb-1.5">Want a person to look at your numbers?</h2>
                <p className="text-slate-400 text-[15px]">Personal diet and finance plans start at ₹149 a month. Everything else on this site stays open to use.</p>
              </div>
              <Link href="/plan" className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-white/15 hover:border-white/30 text-slate-200 font-semibold text-sm transition-colors">
                See plans
              </Link>
            </div>
          </Reveal>
        )}

        {/* ══════════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════════ */}
        <Reveal as="section" className="py-20 border-t border-white/10">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-8">Questions people ask</h2>
          <div className="max-w-2xl">
            {FAQ.map((item, i) => (
              <details key={i} className="group border-b border-white/10 py-4">
                <summary className="flex items-center justify-between gap-4 font-semibold text-[16px] text-white cursor-pointer list-none">
                  {item.q}
                  <span className="text-slate-500 text-xl font-light group-open:rotate-45 transition-transform flex-shrink-0">+</span>
                </summary>
                <p className="text-slate-400 mt-2.5 text-[15px] leading-relaxed">{item.a}</p>
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
