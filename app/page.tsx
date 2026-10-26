import type { Metadata } from 'next';
import type { ReactNode } from 'react';
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
import { Aurora } from '@/components/home/Aurora';
import { Marquee } from '@/components/home/Marquee';
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
  { icon: '🧮', title: 'Your numbers, not averages', body: 'You enter your own height, income and sleep. Results are calculated from them, and the formula is shown so you can check the work.', featured: true },
  { icon: '🧭', title: 'Every result says what to do next', body: 'A number alone does not help. Each calculator explains what yours means and links to the next sensible step.' },
  { icon: '⭐', title: 'A bigger picture, if you want it', body: 'The WellFiLab Score looks at health and money together and shows what to work on first. Skip it and just use the tools.' },
  { icon: '🔒', title: 'Private by default', body: 'Calculators run in your browser. Sign in only if you want history saved across devices.' },
];

const HEALTH_PICKS = ['bmi', 'calories', 'sleep', 'body-fat'].map(s => getBySlug(s)).filter(Boolean) as typeof CALCULATORS;
const FINANCE_PICKS = ['sip', 'loan', 'fire', 'retirement'].map(s => getBySlug(s)).filter(Boolean) as typeof CALCULATORS;
const MARQUEE_CALCS = CALCULATORS.filter(c => c.popular).slice(0, 16);

// Sample outputs for the two-path section's preview tiles — real formulas
// (lib/calc.ts) run against one representative set of inputs, the same way
// LiveCalcHero does. Illustrative, not a claim about the visitor.
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
  { label: 'Body', score: 82, color: '#2DD4BF', delta: '+6' },
  { label: 'Mind', score: 53, color: '#C084FC', delta: '−2' },
  { label: 'Wealth', score: 60, color: '#F59E0B', delta: '+4' },
  { label: 'Life', score: 71, color: '#4ADE80', delta: '+3' },
];

const STATS = [
  { icon: '🧮', value: CALCULATORS.length, suffix: '+', label: 'free calculators' },
  { icon: '📚', value: ALL_POSTS.length, suffix: '', label: 'step-by-step guides' },
  { icon: '🔒', value: 0, suffix: '', label: 'accounts needed to calculate' },
  { icon: '⚡', value: 0, suffix: '', label: 'loading, instant results', isWord: true },
];

/** Small glass pill for the hero marquee. */
function CalcChip({ c }: { c: (typeof CALCULATORS)[number] }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-sm text-slate-300 whitespace-nowrap">
      <span className="text-base leading-none">{c.icon}</span>{c.short}
    </div>
  );
}

/** Glass card shared by the bento grid and FAQ — consistent glow-on-hover
 * treatment across the always-dark marketing sections of this page. */
function Glass({ children, className = '', glow = 'teal' }: { children: ReactNode; className?: string; glow?: 'teal' | 'amber' | 'violet' }) {
  const ring = glow === 'amber' ? 'hover:border-amber-400/30' : glow === 'violet' ? 'hover:border-violet-400/30' : 'hover:border-teal-400/30';
  return (
    <div className={`bg-white/[0.035] border border-white/10 rounded-2xl backdrop-blur-sm transition-colors ${ring} ${className}`}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const latest = [...ALL_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

  return (
    <div className="bg-[#050B0A]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }) }} />

      {/* ══════════════════════════════════════════════
          HERO — centered, product-led: badge → kinetic headline → sub →
          CTAs → trust row → a floating glowing glass card holding the
          real interactive calculator. Aurora drifts behind everything.
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        <Aurora />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Reveal variant="fade">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-semibold mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              {CALCULATORS.length}+ free tools · No signup needed
            </div>
          </Reveal>

          <Reveal variant="fade" delayMs={80}>
            <h1 className="text-5xl sm:text-6xl md:text-[68px] font-extrabold tracking-tight text-white leading-[1.05] text-balance">
              Free calculators<br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-teal-300 via-teal-200 to-amber-200 bg-clip-text text-transparent"> for health and finance.</span>
            </h1>
          </Reveal>

          <Reveal variant="fade" delayMs={160}>
            <p className="text-slate-400 text-lg sm:text-xl leading-relaxed mt-6 mb-9 max-w-2xl mx-auto">
              BMI, calories, sleep, SIP, EMI, FIRE and {CALCULATORS.length}+ more. Type your numbers, watch the result update, and get a clear next step.
            </p>
          </Reveal>

          <Reveal variant="fade" delayMs={240}>
            <div className="flex flex-wrap gap-3 justify-center mb-7">
              <Link href="/tools/health" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#04211E] font-bold text-[15px] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-6px_rgba(45,212,191,0.5)]">
                Browse health tools
              </Link>
              <Link href="/tools/finance" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border-[1.5px] border-white/15 hover:border-white/30 text-slate-200 font-semibold text-[15px] transition-all hover:-translate-y-0.5">
                Browse finance tools
              </Link>
            </div>
          </Reveal>

          <Reveal variant="fade" delayMs={300}>
            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-sm text-slate-500 mb-16">
              {['No signup', 'Free to use', 'Runs in your browser'].map(a => (
                <span key={a} className="flex items-center gap-1.5"><span className="text-teal-400 font-bold">✓</span>{a}</span>
              ))}
            </div>
          </Reveal>

          <Reveal variant="fade" delayMs={380} className="relative max-w-xl mx-auto">
            <div aria-hidden className="absolute -inset-2 rounded-[32px] bg-gradient-to-r from-teal-500/25 to-amber-500/25 blur-2xl opacity-70" />
            <div className="relative dark animate-float" style={{ animationDuration: '7s' }}>
              <LiveCalcHero />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MARQUEE — every tool, in motion, before anyone has to click.
      ══════════════════════════════════════════════ */}
      <div className="relative border-y border-white/5 py-5">
        <Marquee items={MARQUEE_CALCS.map(c => <CalcChip key={c.slug} c={c} />)} />
      </div>

      {/* ══════════════════════════════════════════════
          STATS BENTO
      ══════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <Reveal className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {STATS.map((s, i) => (
            <Glass key={s.label} className="p-5 text-center hover:-translate-y-1 transition-transform duration-300">
              <span className="text-2xl block mb-2">{s.icon}</span>
              <p className="text-[26px] font-extrabold tracking-tight text-white leading-none">
                {s.isWord ? 'Instant' : <><CountUp value={s.value} />{s.suffix}</>}
              </p>
              <p className="text-sm text-slate-500 mt-1.5">{s.label}</p>
            </Glass>
          ))}
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════
          TWO PATHS — glass cards, teal (health) / amber (finance), real
          sample calculator output tiles.
      ══════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <Reveal className="grid md:grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500/[0.08] to-transparent border border-teal-400/15 p-8 sm:p-10">
            <span aria-hidden className="pointer-events-none select-none absolute -bottom-8 -right-2 text-[120px] font-black leading-none tracking-tighter text-teal-300/[0.05]">Health</span>
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-400/80 mb-3">Track your body</p>
              <h3 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white mb-3">Health calculators</h3>
              <p className="text-slate-400 text-[15px] leading-relaxed mb-5 max-w-md">BMI, calories, sleep cycles, body fat, heart rate zones, hydration — understand your body with real numbers, not guesswork.</p>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {[...HEALTH_PICKS.map(c => c.short), `+${Math.max(0, CALCULATORS.filter(c => c.category === 'health').length - HEALTH_PICKS.length)} more`].map(c => (
                  <span key={c} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-400/10 text-teal-300">{c}</span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-7 max-w-sm">
                {HEALTH_PREVIEW.map(p => (
                  <div key={p.label} className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2">
                    <span className="text-base leading-none">{p.icon}</span>
                    <span className="text-xs font-semibold text-slate-300 flex-1 truncate">{p.label}</span>
                    <span className="text-xs font-bold text-teal-300 tabular-nums">{p.value}</span>
                  </div>
                ))}
              </div>
              <Link href="/tools/health" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#04211E] font-bold text-sm transition-all hover:-translate-y-0.5">
                Browse health tools →
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/[0.08] to-transparent border border-amber-400/15 p-8 sm:p-10">
            <span aria-hidden className="pointer-events-none select-none absolute -bottom-8 -right-2 text-[120px] font-black leading-none tracking-tighter text-amber-300/[0.05]">Finance</span>
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400/80 mb-3">Grow your wealth</p>
              <h3 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white mb-3">Finance calculators</h3>
              <p className="text-slate-400 text-[15px] leading-relaxed mb-5 max-w-md">SIP, EMI, FIRE, retirement, income tax, compound interest — make smarter money decisions with tools built for real numbers.</p>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {[...FINANCE_PICKS.map(c => c.short), `+${Math.max(0, CALCULATORS.filter(c => c.category === 'finance').length - FINANCE_PICKS.length)} more`].map(c => (
                  <span key={c} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300">{c}</span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-7 max-w-sm">
                {FINANCE_PREVIEW.map(p => (
                  <div key={p.label} className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2">
                    <span className="text-base leading-none">{p.icon}</span>
                    <span className="text-xs font-semibold text-slate-300 flex-1 truncate">{p.label}</span>
                    <span className="text-xs font-bold text-amber-300 tabular-nums">{p.value}</span>
                  </div>
                ))}
              </div>
              <Link href="/tools/finance" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#2B1600] font-bold text-sm transition-all hover:-translate-y-0.5">
                Browse finance tools →
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS — the self-playing 4-step product tour.
      ══════════════════════════════════════════════ */}
      <section className="relative border-y border-white/5 py-20 overflow-hidden">
        <Aurora variant="soft" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal className="max-w-xl mb-10">
            <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white">See the whole loop in 15 seconds</h2>
            <p className="text-slate-400 mt-3">Watch it play, or tap a step below to jump straight to it.</p>
          </Reveal>
          <Reveal delayMs={100} className="max-w-3xl mx-auto dark">
            <ProductTour />
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHY WELLFILAB — asymmetric bento grid.
      ══════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <Reveal className="mb-9">
          <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white">Built different from day one</h2>
        </Reveal>
        <Reveal delayMs={80} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {REASONS.map(r => (
            <Glass key={r.title} className={`p-7 ${r.featured ? 'sm:col-span-2 lg:col-span-1 lg:row-span-2 flex flex-col justify-center' : ''}`}>
              <span className="text-3xl block mb-4">{r.icon}</span>
              <h3 className={`font-extrabold text-white mb-2 ${r.featured ? 'text-xl' : 'text-lg'}`}>{r.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{r.body}</p>
            </Glass>
          ))}
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════
          DASHBOARD PREVIEW — real score rings/visual language, clearly
          marked as sample data since no visitor has a real score yet.
      ══════════════════════════════════════════════ */}
      <section className="relative bg-[#0A1513] border-y border-white/5 py-20 overflow-hidden">
        <div aria-hidden className="absolute top-0 right-0 w-96 h-96 rounded-full bg-teal-500/[0.06] blur-[120px]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white">A dashboard you will actually open every day</h2>
            <p className="text-slate-400 mt-3.5 mb-6 text-[17px]">Log sleep, water, movement and spending in under a minute. See your trends, tick off today's actions, and keep your goals in one place.</p>
            <ul className="grid gap-3 mb-7">
              {['Daily check-in with weekly trend charts', 'Roadmap actions with estimated impact', 'Goals for weight, savings, score and more', 'Net worth tracker, ready for broker connections'].map(li => (
                <li key={li} className="flex items-start gap-2.5 text-slate-300 text-[15px]">
                  <span className="text-teal-400 font-bold flex-shrink-0">✓</span>{li}
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-400 text-[#04211E] font-bold text-[15px] hover:bg-teal-300 transition-all hover:-translate-y-0.5">
              Explore the dashboard
            </Link>
          </Reveal>

          <Reveal delayMs={150} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 grid gap-4 backdrop-blur-sm" aria-label="Sample dashboard preview">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Good morning, Rahul</span><span>Sample data</span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {MOCK_RINGS.map((r, i) => (
                <div key={r.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 text-center">
                  <div className="relative mx-auto">
                    <AnimatedRing pct={r.score} color={r.color} size={52} thick={5} delayMs={i * 180} />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{r.score}</div>
                  </div>
                  <p className="text-xs font-semibold text-white mt-1">{r.label}</p>
                  <p className={`text-xs ${r.delta.startsWith('−') ? 'text-red-400' : 'text-emerald-400'}`}>{r.delta}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5">
              <div className="flex items-baseline justify-between mb-1">
                <h4 className="text-xs font-semibold text-slate-300">Score over time</h4>
                <span className="text-xs font-bold text-teal-400">+23 in 6 months</span>
              </div>
              <AnimatedTrendChart />
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5">
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 grid gap-2.5 content-start">
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
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 grid gap-2.5 content-start">
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

      {/* ══════════════════════════════════════════════
          GUIDES
      ══════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <Reveal className="max-w-xl mb-9">
          <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white">Learn while you calculate</h2>
          <p className="text-slate-400 mt-3">Each calculator has matching guides that explain the math and what to do with your result.</p>
        </Reveal>
        <Reveal delayMs={80} className="grid sm:grid-cols-2 gap-3.5 dark">
          {latest.map(p => <PostCard key={p.slug} post={p} />)}
        </Reveal>
        <Link href="/guides" className="inline-flex items-center gap-2 px-5 py-2.5 mt-6 rounded-lg border-[1.5px] border-white/15 hover:border-white/30 text-slate-200 font-semibold text-sm transition-colors">
          Read all {ALL_POSTS.length} guides
        </Link>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* ══════════════════════════════════════════════
            PLANS BAND
        ══════════════════════════════════════════════ */}
        {PLANS_ENABLED && (
          <Reveal as="section" className="pb-14">
            <Glass className="p-8 flex flex-wrap justify-between items-center gap-6">
              <div className="max-w-xl">
                <h2 className="text-xl font-extrabold text-white mb-1.5">Want a person to look at your numbers?</h2>
                <p className="text-slate-400 text-[15px]">Personal diet and finance plans start at ₹149 a month. Everything else on this site stays free.</p>
              </div>
              <Link href="/plan" className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-[1.5px] border-white/15 hover:border-white/30 text-slate-200 font-semibold text-sm transition-colors">
                See plans
              </Link>
            </Glass>
          </Reveal>
        )}

        {/* ══════════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════════ */}
        <Reveal as="section" className="py-20">
          <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white mb-8">Questions people ask</h2>
          <div className="max-w-2xl grid gap-2.5">
            {FAQ.map((item, i) => (
              <Glass key={i} className="px-5 py-1">
                <details className="group py-3">
                  <summary className="flex items-center justify-between gap-4 font-semibold text-[16px] text-white cursor-pointer list-none">
                    {item.q}
                    <span className="text-slate-500 text-xl font-light group-open:rotate-45 transition-transform flex-shrink-0">+</span>
                  </summary>
                  <p className="text-slate-400 mt-2.5 text-[15px] leading-relaxed">{item.a}</p>
                </details>
              </Glass>
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
