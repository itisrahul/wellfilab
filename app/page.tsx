import type { Metadata } from 'next';
import Link from 'next/link';
import { Fraunces } from 'next/font/google';
import { CALCULATORS, getByCategory } from '@/config/tools';
import { ALL_POSTS } from '@/lib/posts';
import { ARCHETYPES } from '@/lib/wellfilab-score';
import { PostCard } from '@/components/ui/PostCard';
import { NewsletterSignup } from '@/components/ui/NewsletterSignup';
import { LiveScoreDemo } from '@/components/home/LiveScoreDemo';
import BMICalc from '@/components/tools/widgets/health/BMICalc';
import { SITE_NAME, SITE_URL, PLANS_ENABLED } from '@/config/site';

// A distinctive display serif, scoped to this page only (the rest of the
// site stays on Inter) — real typographic identity instead of another
// gradient-hero SaaS look. Numerals stay in the site's existing mono face.
const serif = Fraunces({ subsets: ['latin'], weight: ['400', '600', '900'], style: ['normal', 'italic'], variable: '--font-serif-display' });

const TRUST_STRIP = [
  { label: 'Secure & Private', body: 'Your data is encrypted and protected' },
  { label: 'Data You Own', body: 'Local by default — sync it only if you want to' },
  { label: 'Personalized for You', body: 'A roadmap built from your own numbers' },
  { label: 'Built for the Long Run', body: 'Retake monthly and watch your score move' },
];

const DIFFERENTIATORS = [
  { n: '01', title: 'Health and money, connected', body: 'Most apps fix one or the other. WellFiLab shows how they connect — a 6-hour sleep habit has a real ₹ cost against your actual income, not a vague warning.' },
  { n: '02', title: 'A roadmap that unlocks, not a checklist', body: "Phase 2 only unlocks after you've acted on Phase 1 — never a 40-item list dumped on you at once." },
  { n: '03', title: 'Every number explained', body: "Why did you lose 8 points on savings rate? We show you the exact factor and its exact weight — never a black-box score you have to just trust." },
];

const STEPS = [
  { n: '01', title: 'Take your score', body: '2 minutes. Real sleep, income, savings, and debt numbers — not self-ratings. One score out of 100, plus exactly why.' },
  { n: '02', title: 'Get your roadmap', body: "Your weakest areas become a phased plan. Phase 2 only unlocks once you've acted on Phase 1." },
  { n: '03', title: 'Track your progress', body: 'Retake monthly. Watch your score move on a real chart — not a guess, and not a one-time snapshot.' },
];

export const metadata: Metadata = {
  title: `${SITE_NAME} — Your Personal Health & Wealth Operating System`,
  description: `Not a calculator, not a quiz. WellFiLab measures your real health and money numbers, tells you what's hurting you most, and gives you a step-by-step roadmap to fix it — free, and it tracks your progress every month.`,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: `${SITE_NAME} — Your Personal Health & Wealth Operating System`,
    description: `Measure. Improve. Track progress. Reach your goals. Free health-wealth score, personalised roadmap, and ${CALCULATORS.length}+ calculators.`,
    type: 'website',
  },
};

const FAQ = [
  {
    q: "What is WellFiLab, exactly?",
    a: "A personal health and wealth operating system. You get a score from your own real numbers, a roadmap that tells you what to fix first and why, goals with real progress tracking, and a dashboard that connects all of it. Calculators are one part of it — not the whole product.",
  },
  {
    q: "How is this different from just using a calculator?",
    a: `A calculator answers one question in isolation — "what's my BMI," "what's my SIP worth in 20 years." WellFiLab connects the answers: your sleep deficit has a real ₹ cost calculated against your actual income, your emergency fund gap becomes a specific roadmap action, and every number rolls up into one score you can track month over month. The ${CALCULATORS.length}+ calculators are the input layer, not the destination.`,
  },
  {
    q: "What actually happens after I get my score?",
    a: "You get a full breakdown of why you scored what you did — which factors gained or lost you points, in plain language. Then a personalised, phased roadmap: Phase 1 unlocks Phase 2 only after you've acted on it, so it's never a 40-item list dumped on you at once. You can turn any target into a tracked goal, and everything lives on one dashboard you come back to.",
  },
  {
    q: "Is my data private?",
    a: "You can use the score, roadmap, and goals with no account at all — that data stays on your own device only. If you create a free account, that same data also syncs to our database (scoped to your account, nobody else's) so it follows you across devices instead of disappearing if you clear your browser.",
  },
  {
    q: "Is it actually free?",
    a: "The score, the roadmap, every calculator, and all guides are free with no signup wall. We offer optional paid plans with expert-crafted, done-for-you diet and finance plans for people who want more than self-serve tools — but nothing about the score or roadmap is paywalled.",
  },
  {
    q: "How accurate is the score?",
    a: "As accurate as the numbers you put in — the whole point is that it's computed from your real sleep hours, income, savings, and habits, not a self-rating out of 5. The algorithm and every point deduction is shown to you, not hidden — you can see exactly why you scored what you scored.",
  },
];

export default function HomePage() {
  const health  = getByCategory('health').filter(c => c.popular).slice(0, 6);
  const finance = getByCategory('finance').filter(c => c.popular).slice(0, 6);
  const latest  = [...ALL_POSTS]
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const featuredArchetypes = ['rebuilder', 'vitalist', 'grinder', 'optimizer']
    .map(id => ARCHETYPES[id]).filter(Boolean);

  return (
    <div className="bg-white dark:bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }) }} />

      {/* ══════════════════════════════════════════════
          1 · HERO — single vertical column (not a split 2-col layout),
          a serif display headline instead of the site's usual Inter, and
          a full-width "instrument panel" live demo instead of a boxed
          card. Monochrome + one accent, no gradients, no glow blobs.
      ══════════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 md:pt-28 pb-16">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-6">WellFiLab — Health & Wealth, One Score</p>

        <h1 className={`${serif.className} text-5xl sm:text-6xl md:text-7xl text-gray-900 dark:text-white leading-[1.05] tracking-tight mb-8 text-balance`}>
          Two numbers<br/>that run your life.<br/>
          <span className="italic text-teal-600 dark:text-teal-400">One score to watch.</span>
        </h1>

        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-10 max-w-xl">
          Your body and your bank account, measured the same honest way — real numbers in, one score out of 100, and a roadmap for what to fix first.
        </p>

        <div className="flex flex-wrap items-center gap-6 mb-16">
          <Link href="/score"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-gray-900 hover:bg-gray-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold text-sm transition-colors">
            Get my free score →
          </Link>
          <Link href="/tools" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Browse {CALCULATORS.length}+ free tools
          </Link>
        </div>

        <LiveScoreDemo />
      </section>

      {/* ── Trust strip — hairline-divided, no icon badges ── */}
      <section className="border-t border-b border-gray-100 dark:border-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_STRIP.map((t, i) => (
              <div key={t.label} className={`px-0 sm:px-6 py-3 sm:py-0 ${i > 0 ? 'sm:border-l sm:border-gray-100 sm:dark:border-gray-900' : ''}`}>
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{t.label}</p>
                <p className="text-xs text-gray-400 mt-1 leading-snug">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 space-y-24">

        {/* ══════════════════════════════════════════════
            2 · WHAT MAKES WELLFILAB DIFFERENT — hairline-divided list with
            large mono numerals, not icon-in-a-box cards.
        ══════════════════════════════════════════════ */}
        <section>
          <h2 className={`${serif.className} text-3xl sm:text-4xl text-gray-900 dark:text-white mb-12`}>A calculator gives you a number.<br/>We give you a system.</h2>
          <div className="divide-y divide-gray-100 dark:divide-gray-900">
            {DIFFERENTIATORS.map(f => (
              <div key={f.n} className="flex gap-6 py-7 first:pt-0">
                <span className="font-mono text-sm text-gray-300 dark:text-gray-700 pt-1 flex-shrink-0">{f.n}</span>
                <div>
                  <p className="font-bold text-base text-gray-900 dark:text-white mb-1.5">{f.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            3 · HOW IT WORKS
        ══════════════════════════════════════════════ */}
        <section id="how-it-works" className="scroll-mt-24">
          <h2 className={`${serif.className} text-3xl sm:text-4xl text-gray-900 dark:text-white mb-12`}>Three steps. That's it.</h2>
          <div className="divide-y divide-gray-100 dark:divide-gray-900">
            {STEPS.map(s => (
              <div key={s.n} className="flex gap-6 py-7 first:pt-0">
                <span className="font-mono text-sm text-gray-300 dark:text-gray-700 pt-1 flex-shrink-0">{s.n}</span>
                <div>
                  <p className="font-bold text-base text-gray-900 dark:text-white mb-1.5">{s.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            4 · TRY A REAL CALCULATOR
        ══════════════════════════════════════════════ */}
        <section>
          <h2 className={`${serif.className} text-3xl sm:text-4xl text-gray-900 dark:text-white mb-3`}>This is a real calculator. Use it.</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">No signup, no click-through — the same BMI calculator that's one of {CALCULATORS.length}+ tools on the site.</p>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <BMICalc />
          </div>
        </section>
      </div>

      {/* ══════════════════════════════════════════════
          5 · CALCULATOR ECOSYSTEM — wider than the editorial column since
          it's a functional grid, not marketing copy.
      ══════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className={`${serif.className} text-2xl sm:text-3xl text-gray-900 dark:text-white`}>{CALCULATORS.length}+ free tools. Your roadmap connects them.</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Each calculator result links to your score and roadmap automatically.</p>
          </div>
          <Link href="/tools" className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline flex-shrink-0">
            View all →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {([
            { calcs:health,  cat:'health'  as const, label:'Health',  accent: 'bg-teal-600' },
            { calcs:finance, cat:'finance' as const, label:'Finance', accent: 'bg-amber-500' },
          ]).map(({ calcs, cat, label, accent }) => (
            <div key={cat} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className={`${accent} px-5 py-3.5 flex items-center justify-between`}>
                <div className="text-white">
                  <p className="font-bold text-sm">{label} Tools</p>
                  <p className="text-[11px] text-white/70">{CALCULATORS.filter(c=>c.category===cat).length} calculators</p>
                </div>
                <Link href={`/tools/${cat}`} className="text-xs font-semibold text-white/80 hover:text-white">All →</Link>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {calcs.map(c => (
                  <Link key={c.slug} href={`/tools/${cat}/${c.slug}`}
                    className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">{c.short}</p>
                      <p className="text-xs text-gray-400 truncate">{c.desc}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-200 dark:text-gray-700 group-hover:text-teal-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-24 pb-24">

        {/* ══════════════════════════════════════════════
            6 · GUIDES ECOSYSTEM
        ══════════════════════════════════════════════ */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className={`${serif.className} text-2xl sm:text-3xl text-gray-900 dark:text-white`}>Guides</h2>
            <Link href="/guides" className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline">
              All {ALL_POSTS.length} guides →
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { cat:'health',    label:'Health'    },
              { cat:'finance',   label:'Finance'   },
              { cat:'nutrition', label:'Nutrition' },
              { cat:'lifestyle', label:'Lifestyle' },
            ].map(({ cat, label }) => (
              <Link key={cat} href={`/guides?category=${cat}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                {label}
                <span className="opacity-50">({ALL_POSTS.filter(p=>p.category===cat).length})</span>
              </Link>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {latest.map(p => <PostCard key={p.slug} post={p} />)}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            NEWSLETTER
        ══════════════════════════════════════════════ */}
        <NewsletterSignup source="homepage" />

        {/* ══════════════════════════════════════════════
            7 · "SUCCESS STORIES" — honestly: real archetypes, not fabricated testimonials
        ══════════════════════════════════════════════ */}
        <section>
          <h2 className={`${serif.className} text-3xl sm:text-4xl text-gray-900 dark:text-white mb-3`}>Which starting point is yours?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
            We don't publish fabricated testimonials — instead, here are 4 of the 8 real archetypes your own score can produce. Not stock photos. The actual classification logic that runs when you take the score.
          </p>
          <div className="divide-y divide-gray-100 dark:divide-gray-900">
            {featuredArchetypes.map(a => (
              <div key={a.id} className="flex gap-5 py-6 first:pt-0">
                <span className="text-2xl flex-shrink-0">{a.emoji}</span>
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{a.name} <span className="font-normal text-gray-400">— {a.tagline}</span></p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1.5 mb-2">{a.description}</p>
                  <p className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">✓ {a.strength}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            8 · FAQ
        ══════════════════════════════════════════════ */}
        <section>
          <h2 className={`${serif.className} text-3xl sm:text-4xl text-gray-900 dark:text-white mb-8`}>Questions people actually ask</h2>
          <div className="divide-y divide-gray-100 dark:divide-gray-900">
            {FAQ.map((item, i) => (
              <details key={i} className="group py-1">
                <summary className="flex items-center justify-between py-4 cursor-pointer font-semibold text-sm text-gray-900 dark:text-gray-100 list-none">
                  {item.q}
                  <span className="text-gray-300 dark:text-gray-700 group-open:rotate-45 transition-transform ml-3 flex-shrink-0 text-lg font-light">+</span>
                </summary>
                <p className="pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            PLANS — kept as a secondary upsell, not the primary CTA
            (hidden while PLANS_ENABLED is false — see config/site.ts)
        ══════════════════════════════════════════════ */}
        {PLANS_ENABLED && <section className="rounded-2xl overflow-hidden -mx-4 sm:mx-0">
          <div className="bg-gray-950 p-10 md:p-14">
            <div className="grid md:grid-cols-5 gap-10 items-center">
              <div className="md:col-span-3">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3">Personalised Plans</p>
                <h2 className={`${serif.className} text-3xl text-white mb-4 leading-snug`}>
                  Beyond the free tools.
                </h2>
                <p className="text-gray-400 leading-relaxed mb-8 text-sm max-w-sm">
                  The score, roadmap, and goals are free and always will be. Our expert-crafted plans are for people who want a done-for-you diet or finance plan on top of that.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/plan"
                    className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-6 py-3 rounded-md text-sm transition-all">
                    View Plans &amp; Pricing →
                  </Link>
                </div>
              </div>
              <div className="md:col-span-2 grid grid-cols-3 gap-3">
                {[
                  { name:'Diet Plan',    price:'₹149/mo' },
                  { name:'Finance Plan', price:'₹149/mo' },
                  { name:'Bundle',       price:'₹249/mo' },
                ].map(p => (
                  <Link key={p.name} href="/plan"
                    className="flex flex-col items-center text-center p-4 rounded-lg border border-white/10 hover:border-white/30 transition-colors">
                    <p className="text-[11px] font-bold text-white mb-0.5">{p.name}</p>
                    <p className="text-[11px] text-white/50 font-semibold">{p.price}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>}

        {/* ══════════════════════════════════════════════
            9 · STRONG FINAL CTA
        ══════════════════════════════════════════════ */}
        <section className="border-t border-gray-100 dark:border-gray-900 pt-16 text-center">
          <h2 className={`${serif.className} text-3xl sm:text-4xl text-gray-900 dark:text-white mb-4`}>You just saw how it works.<br/>Go see your real number.</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
            5 minutes, real numbers, a score you can trust, and a roadmap that tells you exactly what to fix first. Free — no signup required to see it.
          </p>
          <Link href="/score"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-md bg-gray-900 hover:bg-gray-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold text-sm transition-colors">
            Get my free score →
          </Link>
        </section>

      </div>
    </div>
  );
}
