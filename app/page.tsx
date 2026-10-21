import type { Metadata } from 'next';
import Link from 'next/link';
import { CALCULATORS, getByCategory, getBySlug } from '@/config/tools';
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
  title: `${SITE_NAME}: free health and finance calculators`,
  description: `${CALCULATORS.length}+ free calculators for health and finance. Type your numbers, see results instantly, and get a clear next step. No signup needed.`,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: `${SITE_NAME}: free health and finance calculators`,
    description: `BMI, calories, sleep, SIP, EMI, FIRE and more. Real answers, instantly.`,
    type: 'website',
  },
};

const FAQ = [
  { q: 'Are the calculators really free?', a: 'Yes. Every calculator and guide is free, with no signup. Optional paid plans exist for people who want a personal plan built from their numbers.' },
  { q: 'Do you store the numbers I type?', a: 'Calculators run in your browser and your inputs are not sent to our servers. If you sign in, your score history and goals are saved to your account so they follow you across devices.' },
  { q: 'How accurate are the results?', a: 'The math is standard and every formula is shown on each calculator page. Results are estimates: investment returns, inflation and health outcomes vary from person to person.' },
  { q: 'What is the WellFiLab Score?', a: 'An optional five-minute assessment. You enter real numbers such as sleep, weight, income and savings, and get a score with a breakdown of how it was calculated, plus a roadmap of what to fix first.' },
  { q: 'Do I need an account?', a: 'Not to use the calculators. An account adds a dashboard where your score history, goals and daily check-ins are saved.' },
];

const REASONS = [
  { title: 'Your numbers, not averages', body: 'You enter your own height, income and sleep. Results are calculated from them, and the formula is shown so you can check the work.' },
  { title: 'Every result says what to do next', body: 'A number alone does not help. Each calculator explains what yours means and links to the next sensible step.' },
  { title: 'A bigger picture, only if you want it', body: 'The WellFiLab Score looks at your health and money together and shows which to work on first. You can ignore it and just use the tools.' },
  { title: 'Private by default', body: 'Calculators run in your browser and your inputs stay there. Sign in only if you want your history saved across devices.' },
];


const HEALTH_PICKS = ['bmi', 'calories', 'sleep', 'body-fat'].map(s => getBySlug(s)).filter(Boolean) as typeof CALCULATORS;
const FINANCE_PICKS = ['sip', 'loan', 'fire', 'retirement'].map(s => getBySlug(s)).filter(Boolean) as typeof CALCULATORS;

// Sample outputs for the two-path section's preview tiles — the real
// formulas (lib/calc.ts) run against one representative set of inputs, the
// same way LiveCalcHero does. Illustrative, not a claim about the visitor.
const bmiEx = calcBMI(68, 170);
const caloriesEx = calcCalories(68, 170, 30, 'male', 'moderate', 'maintain');
const sleepEx = calcBedtime('06:30')[0];
const bodyFatEx = calcBodyFat(68, 170, 80, 36, 'male');
const sipEx = calcSIP(6500, 12, 20, 0, 0);
const loanEx = calcLoan(2500000, 8.5, 240);
const fireEx = calcFIRE(600000, 500000, 15000, 10);
const retirementEx = calcRetirement(30, 60, 40000, 6, 10, 85);

const HEALTH_PREVIEW = [
  { icon: '⚖️', label: 'BMI', value: bmiEx.bmi.toFixed(1) },
  { icon: '🔥', label: 'Calories', value: caloriesEx.target.toLocaleString('en-IN') },
  { icon: '😴', label: 'Sleep', value: `${sleepEx.hours}h` },
  { icon: '💪', label: 'Body fat', value: `${bodyFatEx.pct}%` },
];
const FINANCE_PREVIEW = [
  { icon: '📈', label: 'SIP (20yr)', value: fmtINR(sipEx.maturity) },
  { icon: '🏦', label: 'EMI', value: fmtINR(loanEx.emi) },
  { icon: '🎯', label: 'FIRE number', value: fmtINR(fireEx.fireNum) },
  { icon: '🧓', label: 'Retirement corpus', value: fmtINR(retirementEx.corpus) },
];
const MOCK_RINGS = [
  { label: 'Body', score: 82, color: '#0D9488', delta: '+6' },
  { label: 'Mind', score: 53, color: '#6D64D8', delta: '−2' },
  { label: 'Wealth', score: 60, color: '#D98A12', delta: '+4' },
  { label: 'Life', score: 71, color: '#2E9E5B', delta: '+3' },
];

export default function HomePage() {
  const latest = [...ALL_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

  return (
    <div className="bg-[#FAFAF7] dark:bg-[#0B1413]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }) }} />

      {/* ══════════════════════════════════════════════
          HERO — a fixed dark band (not theme-dependent, same family of
          dark as the dashboard-preview section below) with headline + lead
          + CTAs on the left, a real 4-tab live calculator (BMI/SIP/FIRE/
          Sleep, same formulas as every tool page) on the right.
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#071411]">
        <div aria-hidden className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(45,212,191,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.07) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }} />
        <div aria-hidden className="absolute -top-28 left-1/4 w-[440px] h-[440px] rounded-full bg-teal-500/10 blur-[100px]" />
        <div aria-hidden className="absolute top-1/3 -right-16 w-72 h-72 rounded-full bg-indigo-500/10 blur-[100px]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-16 md:pt-20 md:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-semibold mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                {CALCULATORS.length}+ free tools · No signup needed
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12] text-balance">
                Free calculators for health and finance.
                <span className="block text-2xl sm:text-3xl font-medium text-slate-400 mt-2.5">Real answers, instantly.</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed mt-6 mb-7 max-w-xl">
                BMI, calories, sleep, SIP, EMI, FIRE and {CALCULATORS.length}+ more. Type your numbers, watch the result update, and get a clear next step.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <Link href="/tools/health" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-500 hover:brightness-110 text-[#04211E] font-bold text-[15px] transition-all">
                  Browse health tools
                </Link>
                <Link href="/tools/finance" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-[1.5px] border-white/15 hover:border-white/30 text-slate-200 font-semibold text-[15px] transition-colors">
                  Browse finance tools
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
                {['No signup', 'Free to use', 'Runs in your browser'].map(a => (
                  <span key={a} className="flex items-center gap-1.5"><span className="text-teal-400 font-bold">✓</span>{a}</span>
                ))}
              </div>
            </div>

            <div className="dark"><LiveCalcHero /></div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FACTS — real counts only, animated count-up on scroll.
      ══════════════════════════════════════════════ */}
      <section className="border-y border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111D1B]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4">
          {[
            { big: <><CountUp value={CALCULATORS.length} />+</>, label: 'calculators' },
            { big: <CountUp value={ALL_POSTS.length} />, label: 'step-by-step guides' },
            { big: <CountUp value={0} />, label: 'accounts needed to calculate' },
            { big: 'Free', label: 'to use, always' },
          ].map((f, i) => {
            const rightCol = i % 2 === 1;
            const bottomRow = i >= 2;
            return (
            <div key={f.label} className={[
              'py-6',
              rightCol ? 'pl-6 sm:pl-6' : 'sm:pl-0',
              bottomRow ? 'border-t sm:border-t-0 border-gray-100 dark:border-gray-800' : '',
              i > 0 ? 'sm:border-l sm:border-gray-100 sm:dark:border-gray-800' : '',
            ].join(' ')}>
              <p className="text-[26px] font-extrabold tracking-tight text-gray-900 dark:text-white leading-none">{f.big}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{f.label}</p>
            </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TWO PATHS — full-bleed split: health tools (teal) vs. finance
          tools (amber), each with real chips, real sample calculator
          output tiles, and its own CTA. Replaces the old plain card grid.
      ══════════════════════════════════════════════ */}
      <Reveal as="section" className="border-b border-gray-200 dark:border-gray-800 grid md:grid-cols-2">
        <div className="relative overflow-hidden bg-teal-50 dark:bg-teal-950/20 p-8 sm:p-12 border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5">
          <span aria-hidden className="pointer-events-none select-none absolute -bottom-8 -right-2 text-[110px] sm:text-[150px] font-black leading-none tracking-tighter text-teal-900/[0.06] dark:text-teal-300/[0.05]">Health</span>
          <div className="relative max-w-md">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-700/70 dark:text-teal-400/70 mb-3">Track your body</p>
            <h3 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-teal-900 dark:text-teal-300 mb-3">Health calculators</h3>
            <p className="text-teal-900/60 dark:text-teal-200/60 text-[15px] leading-relaxed mb-5">BMI, calories, sleep cycles, body fat, heart rate zones, hydration — understand your body with real numbers, not guesswork.</p>
            <div className="flex flex-wrap gap-1.5 mb-6">
              {[...HEALTH_PICKS.map(c => c.short), `+${Math.max(0, CALCULATORS.filter(c => c.category === 'health').length - HEALTH_PICKS.length)} more`].map(c => (
                <span key={c} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-700/10 dark:bg-teal-400/10 text-teal-800 dark:text-teal-300">{c}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {HEALTH_PREVIEW.map(p => (
                <div key={p.label} className="flex items-center gap-2 bg-white/70 dark:bg-white/5 border border-teal-900/10 dark:border-teal-300/10 rounded-lg px-3 py-2">
                  <span className="text-base leading-none">{p.icon}</span>
                  <span className="text-xs font-semibold text-teal-900 dark:text-teal-200 flex-1 truncate">{p.label}</span>
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400 tabular-nums">{p.value}</span>
                </div>
              ))}
            </div>
            <Link href="/tools/health" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-700 dark:bg-teal-500 text-white font-bold text-sm hover:brightness-110 transition-all">
              Browse health tools →
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden bg-amber-50 dark:bg-amber-950/10 p-8 sm:p-12">
          <span aria-hidden className="pointer-events-none select-none absolute -bottom-8 -right-2 text-[110px] sm:text-[150px] font-black leading-none tracking-tighter text-amber-900/[0.06] dark:text-amber-300/[0.05]">Finance</span>
          <div className="relative max-w-md">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700/70 dark:text-amber-400/70 mb-3">Grow your wealth</p>
            <h3 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-amber-900 dark:text-amber-400 mb-3">Finance calculators</h3>
            <p className="text-amber-900/60 dark:text-amber-200/60 text-[15px] leading-relaxed mb-5">SIP, EMI, FIRE, retirement, income tax, compound interest — make smarter money decisions with tools built for real numbers.</p>
            <div className="flex flex-wrap gap-1.5 mb-6">
              {[...FINANCE_PICKS.map(c => c.short), `+${Math.max(0, CALCULATORS.filter(c => c.category === 'finance').length - FINANCE_PICKS.length)} more`].map(c => (
                <span key={c} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-700/10 dark:bg-amber-400/10 text-amber-800 dark:text-amber-300">{c}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {FINANCE_PREVIEW.map(p => (
                <div key={p.label} className="flex items-center gap-2 bg-white/70 dark:bg-white/5 border border-amber-900/10 dark:border-amber-300/10 rounded-lg px-3 py-2">
                  <span className="text-base leading-none">{p.icon}</span>
                  <span className="text-xs font-semibold text-amber-900 dark:text-amber-200 flex-1 truncate">{p.label}</span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 tabular-nums">{p.value}</span>
                </div>
              ))}
            </div>
            <Link href="/tools/finance" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-700 dark:bg-amber-500 dark:text-amber-950 text-white font-bold text-sm hover:brightness-110 transition-all">
              Browse finance tools →
            </Link>
          </div>
        </div>
      </Reveal>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS — a self-playing 4-step product tour instead of
          static numbered cards. Explains the whole loop (Score → Roadmap
          → Goals → Dashboard) by animating it, not describing it.
      ══════════════════════════════════════════════ */}
      <section className="bg-[#F1F3EE] dark:bg-[#101C1A] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-xl mb-10">
            <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-gray-900 dark:text-white">See the whole loop in 15 seconds</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3">Watch it play, or tap a step below to jump straight to it.</p>
          </div>
          <Reveal className="max-w-3xl mx-auto"><ProductTour /></Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          DASHBOARD PREVIEW — real score rings/visual language, clearly
          marked as sample data since no visitor has a real score yet.
      ══════════════════════════════════════════════ */}
      <section className="bg-[#0F2A27] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white">A dashboard you will actually open every day</h2>
            <p className="text-[#93ADA8] mt-3.5 mb-6 text-[17px]">Log sleep, water, movement and spending in under a minute. See your trends, tick off today's actions, and keep your goals in one place.</p>
            <ul className="grid gap-3 mb-7">
              {['Daily check-in with weekly trend charts', 'Roadmap actions with estimated impact', 'Goals for weight, savings, score and more', 'Net worth tracker, ready for broker connections'].map(li => (
                <li key={li} className="flex items-start gap-2.5 text-[#C5D6D2] text-[15px]">
                  <span className="text-teal-400 font-bold flex-shrink-0">✓</span>{li}
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-400 text-[#04211E] font-bold text-[15px] hover:brightness-110 transition-all">
              Explore the dashboard
            </Link>
          </Reveal>

          <Reveal delayMs={150} className="bg-[#0A1B19] border border-[#1F3A36] rounded-2xl p-5 grid gap-4" aria-label="Sample dashboard preview">
            <div className="flex items-center justify-between text-xs text-[#93ADA8]">
              <span>Good morning, Rahul</span><span>Sample data</span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {MOCK_RINGS.map((r, i) => (
                <div key={r.label} className="bg-[#0F2623] rounded-xl p-2.5 text-center">
                  <div className="relative mx-auto">
                    <AnimatedRing pct={r.score} color={r.color} size={52} thick={5} delayMs={i * 180} />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{r.score}</div>
                  </div>
                  <p className="text-xs font-semibold text-white mt-1">{r.label}</p>
                  <p className={`text-xs ${r.delta.startsWith('−') ? 'text-red-400' : 'text-emerald-400'}`}>{r.delta}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#0F2623] rounded-xl p-3.5">
              <div className="flex items-baseline justify-between mb-1">
                <h4 className="text-xs font-semibold text-[#C5D6D2]">Score over time</h4>
                <span className="text-xs font-bold text-teal-400">+23 in 6 months</span>
              </div>
              <AnimatedTrendChart />
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5">
              <div className="bg-[#0F2623] rounded-xl p-3.5 grid gap-2.5 content-start">
                <h4 className="text-xs font-semibold text-[#C5D6D2]">Today</h4>
                {[
                  { label: 'Bedtime alarm set for 10:30 pm', done: true },
                  { label: 'No phone 30 minutes before bed', done: false },
                  { label: 'Raise SIP from ₹3,000 to ₹6,500', done: false },
                ].map((item, i) => (
                  <Reveal key={item.label} delayMs={300 + i * 200} className="flex gap-2 text-xs text-[#C5D6D2]">
                    <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 mt-0.5 ${item.done ? 'border-teal-400 bg-teal-400' : 'border-[#3C5D58]'}`} />
                    <span className={item.done ? 'line-through text-[#6F8984]' : ''}>{item.label}</span>
                  </Reveal>
                ))}
              </div>
              <div className="bg-[#0F2623] rounded-xl p-3.5 grid gap-2.5 content-start">
                <h4 className="text-xs font-semibold text-[#C5D6D2]">Goals</h4>
                <div className="text-xs text-[#C5D6D2]">Emergency fund
                  <AnimatedBar pct={47} delayMs={400} />
                  47% of ₹1.5 lakh
                </div>
                <div className="text-xs text-[#C5D6D2]">Weight 84 → 75 kg
                  <AnimatedBar pct={31} delayMs={700} />
                  31% there
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ══════════════════════════════════════════════
            WHAT MAKES IT DIFFERENT
        ══════════════════════════════════════════════ */}
        <Reveal as="section" className="py-20 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">What makes it different</h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-800 border-t border-gray-200 dark:border-gray-800">
            {REASONS.map(r => (
              <div key={r.title} className="grid md:grid-cols-[1fr_1.6fr] gap-2 md:gap-8 py-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{r.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-[15px]">{r.body}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ══════════════════════════════════════════════
            GUIDES
        ══════════════════════════════════════════════ */}
        <Reveal as="section" className="py-20">
          <div className="max-w-xl mb-9">
            <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-gray-900 dark:text-white">Learn while you calculate</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3">Each calculator has matching guides that explain the math and what to do with your result.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {latest.map(p => <PostCard key={p.slug} post={p} />)}
          </div>
          <Link href="/guides" className="inline-flex items-center gap-2 px-5 py-2.5 mt-6 rounded-lg border-[1.5px] border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-gray-400 text-gray-900 dark:text-white font-semibold text-sm transition-colors">
            Read all {ALL_POSTS.length} guides
          </Link>
        </Reveal>

        {/* ══════════════════════════════════════════════
            PLANS BAND
        ══════════════════════════════════════════════ */}
        {PLANS_ENABLED && (
          <Reveal as="section" className="pb-14">
            <div className="rounded-2xl bg-[#F1F3EE] dark:bg-gray-900 p-8 flex flex-wrap justify-between items-center gap-6">
              <div className="max-w-xl">
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1.5">Want a person to look at your numbers?</h2>
                <p className="text-gray-500 dark:text-gray-400 text-[15px]">Personal diet and finance plans start at ₹149 a month. Everything else on this site stays free.</p>
              </div>
              <Link href="/plan" className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-[1.5px] border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-gray-400 text-gray-900 dark:text-white font-semibold text-sm transition-colors">
                See plans
              </Link>
            </div>
          </Reveal>
        )}

        {/* ══════════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════════ */}
        <Reveal as="section" className="py-20">
          <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">Questions people ask</h2>
          <div className="max-w-2xl">
            {FAQ.map((item, i) => (
              <details key={i} className="group border-b border-gray-200 dark:border-gray-800 py-4">
                <summary className="flex items-center justify-between gap-4 font-semibold text-[17px] text-gray-900 dark:text-white cursor-pointer list-none">
                  {item.q}
                  <span className="text-gray-400 text-xl font-light group-open:rotate-45 transition-transform flex-shrink-0">+</span>
                </summary>
                <p className="text-gray-500 dark:text-gray-400 mt-2.5 text-[15px] leading-relaxed">{item.a}</p>
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
