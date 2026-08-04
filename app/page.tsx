import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, CircleCheck, Fingerprint, LineChart } from 'lucide-react';
import { CALCULATORS, getByCategory } from '@/config/tools';
import { ALL_POSTS } from '@/lib/posts';
import { ARCHETYPES } from '@/lib/wellfilab-score';
import { PostCard } from '@/components/ui/PostCard';
import { NewsletterSignup } from '@/components/ui/NewsletterSignup';
import { LiveScoreDemo } from '@/components/home/LiveScoreDemo';
import BMICalc from '@/components/tools/widgets/health/BMICalc';
import { SITE_NAME, SITE_URL, PLANS_ENABLED } from '@/config/site';

const TRUST_STRIP = [
  { icon: ShieldCheck, label: 'Secure & Private', body: 'Your data is encrypted and protected' },
  { icon: CircleCheck, label: 'Data You Own', body: 'Local by default — sync it only if you want to' },
  { icon: Fingerprint, label: 'Personalized for You', body: 'A roadmap built from your own numbers' },
  { icon: LineChart, label: 'Built for the Long Run', body: 'Retake monthly and watch your score move' },
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
    .slice(0, 6);

  const featuredArchetypes = ['rebuilder', 'vitalist', 'grinder', 'optimizer']
    .map(id => ARCHETYPES[id]).filter(Boolean);

  return (
    <div className="bg-white dark:bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }) }} />

      {/* ══════════════════════════════════════════════
          1 · HERO — restrained (no gradients, no glow blobs), built around
          a real, working mini-score calculator instead of a screenshot or
          mockup. The product explains itself by being used, not described.
      ══════════════════════════════════════════════ */}
      <section className="border-b border-gray-100 dark:border-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">

            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-6 text-balance">
                <span className="block text-gray-900 dark:text-white">Your health.</span>
                <span className="block text-gray-900 dark:text-white">Your wealth.</span>
                <span className="block text-teal-600 dark:text-teal-400">One real score.</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                Move the sliders on the right — that's the actual scoring engine, not a demo. Your real sleep, stress, savings, and debt become one number, and a roadmap for what to fix first.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                <Link href="/score"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gray-900 hover:bg-gray-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-bold text-base transition-colors">
                  Get my free score →
                </Link>
                <Link href="/tools"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-bold text-base border border-gray-200 dark:border-gray-800 transition-colors">
                  Browse {CALCULATORS.length}+ free tools
                </Link>
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Free · No signup required to see your score</p>
            </div>

            <div className="max-w-sm mx-auto w-full">
              <LiveScoreDemo />
            </div>
          </div>

          {/* ── Trust strip ── */}
          <div className="mt-16 md:mt-20 pt-10 border-t border-gray-100 dark:border-gray-900">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TRUST_STRIP.map(t => (
                <div key={t.label} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <t.icon size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{t.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">{t.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-20">

        {/* ══════════════════════════════════════════════
            2 · WHAT MAKES WELLFILAB DIFFERENT — trimmed to the 3 sharpest
            points instead of 6, now that the hero demo already shows most
            of this rather than just claiming it.
        ══════════════════════════════════════════════ */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2 text-center">What makes WellFiLab different</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-10 text-center">A calculator gives you a number. We give you a system.</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon:'🔗', title:'Health and money, connected', body:'Most apps fix one or the other. WellFiLab shows how they connect — a 6-hour sleep habit has a real ₹ cost against your actual income, not a vague warning.' },
              { icon:'🗺️', title:'A roadmap that unlocks, not a checklist', body:"Phase 2 only unlocks after you've acted on Phase 1 — never a 40-item list dumped on you at once." },
              { icon:'🔍', title:'Every number explained', body:"Why did you lose 8 points on savings rate? We show you the exact factor and its exact weight — never a black-box score you have to just trust." },
            ].map(f => (
              <div key={f.title} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                <div className="text-3xl mb-4">{f.icon}</div>
                <p className="font-bold text-base text-gray-900 dark:text-white mb-2">{f.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            3 · HOW IT WORKS — three steps, text only. No second mockup
            card here — the hero already proved the concept for real.
        ══════════════════════════════════════════════ */}
        <section id="how-it-works" className="scroll-mt-24">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">How it works</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Three steps. That's it.</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-9 h-9 rounded-lg bg-gray-900 dark:bg-teal-600 text-white font-black flex items-center justify-center mb-4 text-sm">1</div>
              <p className="font-bold text-base text-gray-900 dark:text-white mb-2">Take your score</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">2 minutes. Real sleep, income, savings, and debt numbers — not self-ratings. One score out of 100, plus exactly why.</p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-9 h-9 rounded-lg bg-gray-900 dark:bg-teal-600 text-white font-black flex items-center justify-center mb-4 text-sm">2</div>
              <p className="font-bold text-base text-gray-900 dark:text-white mb-2">Get your roadmap</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Your weakest areas become a phased plan. Phase 2 only unlocks once you've acted on Phase 1.</p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-9 h-9 rounded-lg bg-gray-900 dark:bg-teal-600 text-white font-black flex items-center justify-center mb-4 text-sm">3</div>
              <p className="font-bold text-base text-gray-900 dark:text-white mb-2">Track your progress</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Retake monthly. Watch your score move on a real chart — not a guess, and not a one-time snapshot.</p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            4 · TRY A REAL CALCULATOR — the second "use it, don't read
            about it" moment. A real, fully working tool embedded directly,
            no navigation required.
        ══════════════════════════════════════════════ */}
        <section>
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Try it yourself — right here</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">This is a real calculator. Use it.</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">No signup, no click-through — the same BMI calculator that's one of {CALCULATORS.length}+ tools on the site.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <BMICalc />
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            5 · CALCULATOR ECOSYSTEM
        ══════════════════════════════════════════════ */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-1">Every other tool</p>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{CALCULATORS.length}+ free tools. Use any. Your roadmap connects them.</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Each calculator result links to your score and roadmap automatically.</p>
            </div>
            <Link href="/tools" className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline flex-shrink-0">
              View all →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {([
              { calcs:health,  cat:'health'  as const, label:'Health',  icon:'🌿', accent: 'bg-teal-600' },
              { calcs:finance, cat:'finance' as const, label:'Finance', icon:'💰', accent: 'bg-amber-500' },
            ]).map(({ calcs, cat, label, icon, accent }) => (
              <div key={cat} className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className={`${accent} px-5 py-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-2.5 text-white">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <p className="font-extrabold text-sm">{label} Tools</p>
                      <p className="text-[11px] text-white/70">{CALCULATORS.filter(c=>c.category===cat).length} calculators</p>
                    </div>
                  </div>
                  <Link href={`/tools/${cat}`} className="text-xs font-semibold text-white/80 hover:text-white">All →</Link>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {calcs.map(c => (
                    <Link key={c.slug} href={`/tools/${cat}/${c.slug}`}
                      className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                      <span className="text-xl flex-shrink-0">{c.icon}</span>
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
        </section>

        {/* ══════════════════════════════════════════════
            6 · GUIDES ECOSYSTEM
        ══════════════════════════════════════════════ */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-1">Evidence-Based</p>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Guides</h2>
            </div>
            <Link href="/guides" className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline">
              All {ALL_POSTS.length} guides →
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { cat:'health',    label:'Health',    icon:'💪', c:'text-teal-600   border-teal-200   bg-teal-50   dark:bg-teal-950/20 dark:border-teal-800 dark:text-teal-400'   },
              { cat:'finance',   label:'Finance',   icon:'💰', c:'text-amber-600  border-amber-200  bg-amber-50  dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400'  },
              { cat:'nutrition', label:'Nutrition', icon:'🥗', c:'text-green-600  border-green-200  bg-green-50  dark:bg-green-950/20 dark:border-green-800 dark:text-green-400'  },
              { cat:'lifestyle', label:'Lifestyle', icon:'🌿', c:'text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800 dark:text-purple-400' },
            ].map(({ cat, label, icon, c }) => (
              <Link key={cat} href={`/guides?category=${cat}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${c}`}>
                {icon} {label}
                <span className="opacity-50">({ALL_POSTS.filter(p=>p.category===cat).length})</span>
              </Link>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Proof, not promises</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Which starting point is yours?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              We don't publish fabricated testimonials — instead, here are 4 of the 8 real archetypes your own score can produce. Not stock photos. The actual classification logic that runs when you take the score.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {featuredArchetypes.map(a => (
              <div key={a.id} className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{a.emoji}</span>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.tagline}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{a.description}</p>
                <p className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">✓ {a.strength}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            8 · FAQ
        ══════════════════════════════════════════════ */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Questions people actually ask</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-2">
            {FAQ.map((item, i) => (
              <details key={i} className="group bg-gray-50 dark:bg-gray-900 rounded-xl border-l-4 border-l-transparent open:border-l-teal-500 overflow-hidden transition-colors">
                <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-sm text-gray-900 dark:text-gray-100 list-none">
                  {item.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform ml-3 flex-shrink-0">▾</span>
                </summary>
                <p className="px-4 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            PLANS — kept as a secondary upsell, not the primary CTA
            (hidden while PLANS_ENABLED is false — see config/site.ts)
        ══════════════════════════════════════════════ */}
        {PLANS_ENABLED && <section className="rounded-3xl overflow-hidden">
          <div className="bg-gray-950 p-10 md:p-14">
            <div className="grid md:grid-cols-5 gap-10 items-center">
              <div className="md:col-span-3">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3">Personalised Plans</p>
                <h2 className="text-3xl font-extrabold text-white mb-4 leading-snug">
                  Beyond the free tools.
                </h2>
                <p className="text-gray-400 leading-relaxed mb-8 text-sm max-w-sm">
                  The score, roadmap, and goals are free and always will be. Our expert-crafted plans are for people who want a done-for-you diet or finance plan on top of that.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/plan"
                    className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all">
                    View Plans &amp; Pricing →
                  </Link>
                </div>
              </div>
              <div className="md:col-span-2 grid grid-cols-3 gap-3">
                {[
                  { icon:'🥗', name:'Diet Plan',    price:'₹149/mo',  grad:'from-teal-600 to-emerald-600' },
                  { icon:'💰', name:'Finance Plan',  price:'₹149/mo', grad:'from-amber-600 to-orange-500' },
                  { icon:'⭐', name:'Bundle',        price:'₹249/mo', grad:'from-purple-600 to-pink-600'  },
                ].map(p => (
                  <Link key={p.name} href="/plan"
                    className={`flex flex-col items-center text-center p-4 rounded-2xl bg-gradient-to-br ${p.grad} text-white hover:scale-[1.03] transition-transform`}>
                    <span className="text-3xl mb-2">{p.icon}</span>
                    <p className="text-[11px] font-bold mb-0.5">{p.name}</p>
                    <p className="text-[11px] text-white/60 font-semibold">{p.price}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>}

        {/* ══════════════════════════════════════════════
            9 · STRONG FINAL CTA
        ══════════════════════════════════════════════ */}
        <section className="text-center py-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">You just saw how it works. Go see your real number.</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8">
            5 minutes, real numbers, a score you can trust, and a roadmap that tells you exactly what to fix first. Free — no signup required to see it.
          </p>
          <Link href="/score"
            className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-gray-900 hover:bg-gray-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-extrabold text-base transition-colors">
            Get my free score →
          </Link>
        </section>

      </div>
    </div>
  );
}
