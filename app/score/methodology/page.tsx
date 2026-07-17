import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  title: `Scoring Methodology | ${SITE_NAME}`,
  description: 'Exactly how the WellFiLab Score is calculated — every formula, weight, and assumption, in plain language.',
  alternates: { canonical: `${SITE_URL}/score/methodology` },
};

function Row({ label, value, points }: { label: string; value: string; points: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 text-sm border-b border-gray-50 dark:border-gray-800 last:border-0">
      <span className="font-semibold text-gray-700 dark:text-gray-300">{label}</span>
      <span className="text-gray-500 dark:text-gray-400">{value}</span>
      <span className="text-right font-mono text-gray-600 dark:text-gray-400">{points}</span>
    </div>
  );
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
      <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-4">{icon} {title}</h2>
      {children}
    </section>
  );
}

export default function MethodologyPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="bg-gray-950">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <nav className="text-xs text-white/40 mb-4">
            <Link href="/score" className="hover:text-white">Score</Link> / Methodology
          </nav>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3">How it's calculated</p>
          <h1 className="text-3xl font-extrabold text-white mb-3">The WellFiLab Score, in full</h1>
          <p className="text-white/60 leading-relaxed max-w-xl">
            Every formula, weight, and assumption behind your score — no black box. This is a rule-based model
            reflecting general, published health and financial research, computed entirely from the numbers you
            enter. It is not a medical or financial diagnosis.
          </p>
          <p className="text-[11px] text-white/40 mt-4">Scoring methodology v2 · Last updated 17 Jul 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        <Section icon="🧮" title="The four dimensions">
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
            Body, Mind and Wealth each start at 100 points and lose points for every factor below that falls short
            of a healthy reference range. Life blends the three. Overall blends all four.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="font-bold text-gray-800 dark:text-gray-200">Overall</p>
              <p className="text-gray-500 dark:text-gray-400 font-mono text-xs mt-1">Body×28% + Mind×28% + Wealth×28% + Life×16%</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="font-bold text-gray-800 dark:text-gray-200">Life</p>
              <p className="text-gray-500 dark:text-gray-400 font-mono text-xs mt-1">(Body+Mind+Wealth)×30% each + a balance bonus (10%) that shrinks the further apart your three scores are</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            The balance term exists because one severely lagging area tends to drag down the others in real life —
            a very high Wealth score next to a very low Body score scores lower on Life than three evenly-matched
            scores at the same average, on purpose.
          </p>
        </Section>

        <Section icon="💪" title="Body score factors">
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            <div className="grid grid-cols-3 gap-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600">
              <span>Factor</span><span>Rule</span><span className="text-right">Points</span>
            </div>
            <Row label="BMI" value="Under 18.5 or over 30 / 25–30" points="−20 / −10" />
            <Row label="Sleep" value="Each hour below 7.5h/night" points="−8 / hour" />
            <Row label="Exercise" value="Each day below 4 days/week" points="−5 / day" />
            <Row label="Diet quality" value="Each point below 5/5 self-rating" points="−4 / point" />
            <Row label="Hydration" value="Below 80% of weight × 0.033L/day" points="−5" />
            <Row label="Age" value="Each year over 40, capped" points="−0.3 / yr, max −8" />
          </div>
          <p className="text-xs text-gray-400 mt-3">Clamped to a 10–98 range after all deductions.</p>
        </Section>

        <Section icon="🧠" title="Mind score factors">
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            <div className="grid grid-cols-3 gap-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600">
              <span>Factor</span><span>Rule</span><span className="text-right">Points</span>
            </div>
            <Row label="Stress level" value="Each point above 1/10" points="−7 / point" />
            <Row label="Sleep (mental load)" value="Under 6h / 6–7h per night" points="−20 / −10" />
            <Row label="Debt load" value="Over 3× / 1–3× annual income" points="−15 / −7" />
          </div>
          <p className="text-xs text-gray-400 mt-3">Clamped to a 10–98 range. Sleep and debt each affect Mind separately from how they affect Body and Wealth — the same real-world factor genuinely costs you in more than one place.</p>
        </Section>

        <Section icon="💰" title="Wealth score factors">
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            <div className="grid grid-cols-3 gap-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600">
              <span>Factor</span><span>Rule</span><span className="text-right">Points</span>
            </div>
            <Row label="Savings rate" value="Under 20% / 10% / 0% / negative" points="−10 / −20 / −30 / −40" />
            <Row label="Emergency fund" value="Don't have one" points="−20" />
            <Row label="Insurance" value="Don't have health insurance" points="−10" />
            <Row label="Investment rate" value="Under 20% / 10% / any / none of income" points="−10 / −18 / −25" />
            <Row label="Debt load" value="Over 5× / 2–5× annual income" points="−15 / −8" />
          </div>
          <p className="text-xs text-gray-400 mt-3">Clamped to a 10–98 range.</p>
        </Section>

        <Section icon="💸" title="Health cost estimates">
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
            The ₹/year figures shown alongside your score (sleep deficit cost, stress cost, BMI-related cost,
            exercise savings) are directional estimates, not measured facts:
          </p>
          <div className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
            <Row label="Sleep deficit" value="Hours short of 7.5 × 2.4% of income" points="per year" />
            <Row label="High stress" value="(Stress−5)/5 × 18% of income, if stress ≥ 6" points="per year" />
            <Row label="BMI" value="Flat estimate if BMI over 25 / 30" points="₹18K / ₹35K" />
            <Row label="Exercise" value="Flat saving if 3+ / 1+ days a week" points="₹24K / ₹12K" />
          </div>
          <p className="text-xs text-gray-400 mt-3">
            The 2.4%/hour and 18% figures are simplified assumptions applied to your real income, in the general
            direction of published sleep/stress-and-productivity research — treat them as a reason to take the
            underlying habit seriously, not a precise bill. We do not cite a specific study for the exact
            percentages, because we don't have one we can stand behind as precise.
          </p>
        </Section>

        <Section icon="📈" title="Life trajectories">
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
            The three "your life, three ways" projections compound your current savings and a monthly SIP forward
            to age 60:
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="font-bold text-gray-800 dark:text-gray-200 text-xs mb-1">Current</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Your real SIP amount, 12% assumed annual return</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="font-bold text-gray-800 dark:text-gray-200 text-xs mb-1">Improved</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">SIP raised to 15% of income (if higher than current), 12% return</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="font-bold text-gray-800 dark:text-gray-200 text-xs mb-1">Optimal</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">SIP at 25% of income, 14% assumed return</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Existing savings compound at the same assumed rate as the SIP — not added as a flat, un-invested lump
            sum. 12%/14% are illustrative long-run equity-market assumptions, not a guarantee; real returns vary
            year to year and can be negative in any given year.
          </p>
        </Section>

        <Section icon="⚖️" title="How you compare">
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            "How you compare" on your results page shows a score band (Critical / Needs Work / Average / Good /
            Excellent) and, where you have history, your change vs. your first and best assessments. We do not
            claim to compare you against other WellFiLab users or an age cohort — we don't collect or aggregate
            real user score data today, so we won't present a percentile as if we did.
          </p>
        </Section>

        <Section icon="🔒" title="Your data">
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Your score, inputs, and history are stored only in your browser's local storage on this device.
            Nothing is sent to a server or shared. Clearing your browser data or switching devices loses your
            history — there is no account-wide sync today.
          </p>
        </Section>

        <div className="text-center pt-4">
          <Link href="/score" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all">
            Take (or retake) the Score →
          </Link>
        </div>

      </div>
    </div>
  );
}
