import type { Metadata } from 'next';
import Link from 'next/link';
import { CALCULATORS } from '@/config/tools';
import { ALL_POSTS } from '@/lib/posts';
import { PostCard } from '@/components/ui/PostCard';
import { NewsletterSignup } from '@/components/ui/NewsletterSignup';
import { calcBMI, calcCalories, calcBedtime, calcBodyFat, calcSIP, calcLoan, calcFIRE, calcRetirement } from '@/lib/calc';
import { fmtINR } from '@/lib/roadmapActions';
import { GOAL_TYPE_META, type GoalType } from '@/lib/goalsStorage';
import { Reveal } from '@/components/home/Reveal';
import { ProductTour } from '@/components/home/ProductTour';
import { FeatureGrid } from '@/components/home/FeatureGrid';
import { SITE_NAME, SITE_URL, PLANS_ENABLED } from '@/config/site';

export const metadata: Metadata = {
  title: `${SITE_NAME}: set a goal, get a financial plan`,
  description: `${CALCULATORS.length}+ finance and health calculators, a real assessment, and a phased roadmap toward your goal. No signup needed — type your numbers and see results instantly.`,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: `${SITE_NAME}: set a goal, get a financial plan`,
    description: `SIP, EMI, FIRE, retirement, BMI, calories and more. Real answers, instantly.`,
    type: 'website',
  },
};

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

// Quick-start links into the real goal-creation flow (/goals/new?type=…) —
// the same GOAL_TYPE_META the Goals pages use, not a second invented list.
// "Build a crore" and "Financial freedom" both exist as real goal types
// (net-worth and fire-corpus); a dedicated "Retirement" type doesn't exist
// separately from fire-corpus, so it isn't duplicated here.
const POPULAR_GOALS: { type: GoalType; label: string; target?: number }[] = [
  { type: 'net-worth', label: 'Build ₹1 Crore', target: 10000000 },
  { type: 'fire-corpus', label: 'Financial Freedom' },
  { type: 'home-down-payment', label: 'Buy a House' },
  { type: 'education-fund', label: 'Child Education' },
  { type: 'emergency-fund', label: 'Emergency Fund' },
  { type: 'debt-freedom', label: 'Become Debt Free' },
  { type: 'custom', label: 'Custom Goal' },
];

export default function HomePage() {
  const latest = [...ALL_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

  return (
    <div className="bg-white dark:bg-gray-950">

      {/* ══════════════════════════════════════════════
          TOP — the feature grid itself IS the hero. Flat background, no
          wash, no drift — straight into the real product, one line of
          intro, then what you actually get, demonstrated with live
          visuals instead of a pitch.
      ══════════════════════════════════════════════ */}
      <section className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16 md:pt-12 md:pb-20">
          <Reveal className="mb-7">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Set a goal. See where you stand.{' '}
              <span className="font-normal text-gray-500 dark:text-gray-400">
                Get a plan. Track it automatically.
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <Link href="/score" className="inline-flex items-center px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-[#04211E] font-semibold text-sm transition-colors">
                Start Assessment
              </Link>
              <Link href="/tools" className="inline-flex items-center px-5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 text-gray-800 dark:text-gray-200 font-semibold text-sm transition-colors">
                Browse Calculators
              </Link>
            </div>
          </Reveal>

          <Reveal delayMs={60} className="mb-8 md:mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Popular goals</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_GOALS.map(g => (
                <Link key={g.type} href={`/goals/new?type=${g.type}${g.target ? `&target=${g.target}` : ''}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 text-sm text-gray-700 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                  <span>{GOAL_TYPE_META[g.type].icon}</span>{g.label}
                </Link>
              ))}
            </div>
          </Reveal>

          <FeatureGrid healthPreview={HEALTH_PREVIEW} financePreview={FINANCE_PREVIEW} guideCount={ALL_POSTS.length} calcCount={CALCULATORS.length} />
        </div>
      </section>

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
            GUIDES
        ══════════════════════════════════════════════ */}
        <Reveal as="section" className="py-20">
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
            NEWSLETTER
        ══════════════════════════════════════════════ */}
        <Reveal as="section" className="py-20 border-t border-gray-100 dark:border-gray-800">
          <NewsletterSignup source="homepage" />
        </Reveal>
      </div>
    </div>
  );
}
