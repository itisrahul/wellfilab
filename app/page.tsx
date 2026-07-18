import type { Metadata } from 'next';
import Link from 'next/link';
import { CALCULATORS, getByCategory } from '@/config/tools';
import { ALL_POSTS } from '@/lib/posts';
import { ARCHETYPES } from '@/lib/wellfilab-score';
import { PostCard } from '@/components/ui/PostCard';
import { NewsletterSignup } from '@/components/ui/NewsletterSignup';
import { SITE_NAME, SITE_URL } from '@/config/site';

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

const POPULAR_SLUGS = ['bmi','calories','body-fat','sleep','sip','loan','retirement','income-tax','fire','compound'];
const popular = POPULAR_SLUGS.map(s => CALCULATORS.find(c => c.slug === s)).filter(Boolean) as typeof CALCULATORS;

// Same 4 core dimensions the algorithm actually returns (score.body/mind/wealth/life),
// same colours as the dashboard's dimension bars — one visual language across the site.
const SCORE_DIMS = [
  { icon:'💪', label:'Body',   color:'bg-teal-500'   },
  { icon:'🧠', label:'Mind',   color:'bg-indigo-500' },
  { icon:'💰', label:'Wealth', color:'bg-amber-500'  },
  { icon:'🌱', label:'Life',   color:'bg-green-500'  },
];

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
    a: "Your score, goals, and history are stored on your own device, not in a central database we can browse. We're upfront about the tradeoff: that also means clearing your browser data loses your history today — we'd rather say that plainly than pretend otherwise.",
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
          1 · HERO — answers "where am I / what's my problem / how does this help" in one screen
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-500">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}/>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/10 to-transparent"/>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <p className="inline-flex items-center gap-1.5 mb-6 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-widest">
            Your Personal Health &amp; Wealth Operating System
          </p>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Know your score.<br/>
            Fix what's hurting you first.<br/>
            Watch it improve every month.
          </h1>

          <p className="text-teal-100/85 text-xl leading-relaxed mb-4 max-w-2xl mx-auto">
            Not a calculator. Not a quiz. WellFiLab measures your real health and money numbers, tells you exactly what's costing you the most, and gives you a step-by-step plan — then tracks whether it's actually working.
          </p>
          <p className="text-teal-100/60 text-sm mb-10">
            Free · 5 minutes · No signup required to see your score
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link href="/score"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-teal-800 font-extrabold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all">
              Get my free score →
            </Link>
            <Link href="/tools"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-base border-2 border-white/30 hover:border-white/50 transition-all">
              Browse {CALCULATORS.length}+ free tools →
            </Link>
          </div>

          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Most popular</p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {popular.map(c => (
                <Link key={c.slug} href={`/tools/${c.category}/${c.slug}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/12 hover:bg-white/22 border border-white/20 hover:border-white/40 text-white text-sm font-semibold transition-all hover:scale-[1.03] backdrop-blur-sm">
                  <span className="text-lg">{c.icon}</span>
                  {c.short}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-20">

        {/* ══════════════════════════════════════════════
            2 · WHAT MAKES WELLFILAB DIFFERENT
        ══════════════════════════════════════════════ */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2 text-center">What makes WellFiLab different</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3 text-center">A calculator gives you a number. We give you a system.</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-2xl mx-auto mb-10">
            WellFiLab isn't a calculator website, a quiz, or a blog — it's the layer that connects all three into one loop: measure, improve, track, repeat.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon:'🔗', title:'Health and money, connected', body:'Most apps fix one or the other. WellFiLab shows how they connect — a 6-hour sleep habit has a real ₹ cost against your actual income, not a vague warning.' },
              { icon:'📊', title:'Your actual numbers, not self-ratings', body:'Enter your real sleep hours, income, savings, weight. Every point in your score traces back to a number you entered — never a 1-5 self-rating dressed up as data.' },
              { icon:'🗺️', title:'A roadmap that unlocks, not a checklist', body:"Most tools stop at a score and leave you guessing. Phase 2 of your roadmap only unlocks after you've acted on Phase 1 — never a 40-item list dumped on you at once." },
              { icon:'🎯', title:'Goals with real pace, not guesses', body:"Set a target and we track it against your actual rate of progress — a real forecast date, not a placeholder, and it says nothing until there's enough real movement to trust." },
              { icon:'📈', title:'A score you can watch move', body:"Retake monthly and see your trend, not just a snapshot — the same discipline behind every dimension, applied over time instead of once." },
              { icon:'🔍', title:'Every number explained', body:"Why did you lose 8 points on savings rate? We show you the exact factor and its exact weight — never a black-box score you have to just trust." },
            ].map(f => (
              <div key={f.title} className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="text-3xl mb-4">{f.icon}</div>
                <p className="font-bold text-base text-gray-900 dark:text-white mb-2">{f.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            3 · HEALTH SCORE EXAMPLE
        ══════════════════════════════════════════════ */}
        <section>
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-2">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Flow 1 — Health only</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Your Health Score, from real numbers</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                Sleep hours, exercise days, stress level, diet quality — entered once, scored honestly. Not "how healthy do you feel," but what your actual habits add up to.
              </p>
              <Link href="/tools/health" className="text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline">Explore health tools →</Link>
            </div>
            <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Example — illustrative, not a real user</p>
                <span className="font-mono tabular-nums text-3xl font-black text-teal-600 dark:text-teal-400">62<span className="text-sm text-gray-300 dark:text-gray-600">/100</span></span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Sleep', value: 74, detail: '6.2 hrs/night — 1.3h below optimal' },
                  { label: 'Movement', value: 30, detail: '2 days/week — below the 3-day minimum' },
                  { label: 'Stress', value: 46, detail: '6/10 — moderately high' },
                ].map(d => (
                  <div key={d.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{d.label}</span>
                      <span className="font-mono tabular-nums font-bold text-gray-900 dark:text-white">{d.value}/100</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${d.value}%` }} />
                    </div>
                    <p className="text-[11px] text-gray-400">{d.detail}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 rounded-lg p-3 mt-4">
                💡 Movement is the biggest opportunity here — going from 2 to 3 days/week is the single highest-leverage change on this roadmap.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            4 · WEALTH SCORE EXAMPLE
        ══════════════════════════════════════════════ */}
        <section>
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3 order-2 lg:order-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Example — illustrative, not a real user</p>
                <span className="font-mono tabular-nums text-3xl font-black text-amber-600 dark:text-amber-400">54<span className="text-sm text-gray-300 dark:text-gray-600">/100</span></span>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: 'Savings rate', value: '18% of income', pts: '+0' },
                  { label: 'Emergency fund', value: 'None saved', pts: '-20' },
                  { label: 'Investing', value: '₹0/month', pts: '-25' },
                  { label: 'Debt-to-income', value: '0.8× annual income', pts: '0' },
                  { label: 'Health insurance', value: 'Covered', pts: '0' },
                ].map(f => (
                  <div key={f.label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{f.label}</p>
                      <p className="text-[11px] text-gray-400">{f.value}</p>
                    </div>
                    <span className={`font-mono tabular-nums text-xs font-bold ${f.pts.startsWith('-') ? 'text-red-500' : 'text-gray-400'}`}>{f.pts}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 mt-4">
                💡 Not investing is the single biggest point loss here — a ₹8,000/month SIP started today grows to roughly ₹80L in 20 years at a 12% assumed return.
              </p>
            </div>
            <div className="lg:col-span-2 order-1 lg:order-2">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">Flow 2 — Wealth only</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Your Wealth Score, factor by factor</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                Savings rate, emergency fund, debt-to-income, investing consistency, insurance, and net worth benchmarked to your age — every point traced to a real number, never hidden.
              </p>
              <Link href="/tools/finance" className="text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline">Explore finance tools →</Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            5 · COMBINED SCORE EXAMPLE — dramatic feature card
        ══════════════════════════════════════════════ */}
        <section>
          <Link href="/score" className="group block">
            <div className="relative overflow-hidden rounded-3xl bg-gray-950 dark:bg-gray-900 p-8 md:p-12 hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none"/>
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"/>

              <div className="relative grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3">Flow 3 — Health + Wealth combined</p>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                    Your health and money<br/>are more connected than you think.
                  </h2>
                  <p className="text-gray-400 leading-relaxed mb-8 text-base">
                    Body, Mind, Wealth, and Life roll up into one WellFiLab Score — <span className="text-white font-bold font-mono tabular-nums">61/100</span> in this example — so you see the whole picture, not four disconnected numbers.
                  </p>
                  <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-teal-500 group-hover:bg-teal-400 text-white font-bold text-sm transition-all group-hover:shadow-lg group-hover:shadow-teal-500/30">
                    Get my free score →
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </div>
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { ...SCORE_DIMS[0], score: 68 }, { ...SCORE_DIMS[1], score: 60 },
                      { ...SCORE_DIMS[2], score: 54 }, { ...SCORE_DIMS[3], score: 61 },
                    ].map(d => (
                      <div key={d.label} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
                        <div className={`w-8 h-8 rounded-lg ${d.color} flex items-center justify-center text-base flex-shrink-0`}>{d.icon}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-white font-semibold text-xs">{d.label}</p>
                            <p className="text-white/70 font-mono tabular-nums text-xs font-bold">{d.score}</p>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1.5">
                            <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.score}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 text-center">
                    <p className="text-xs text-gray-400">Real inputs · Based on your data · Free · Always · Roadmap included</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* ══════════════════════════════════════════════
            6 · SAMPLE ROADMAP EXAMPLE
        ══════════════════════════════════════════════ */}
        <section>
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">What you get next</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">A roadmap that unlocks as you go</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Three phases, built from your weakest dimensions. Phase 2 only unlocks once you've acted on Phase 1 — never a 40-item list on day one.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { phase: 'Phase 1', label: 'Foundation', status: 'Active', action: 'Build a 3-month emergency fund', impact: '+8 score · Medium · 4 months', color: 'border-teal-400 bg-teal-50 dark:bg-teal-950/20' },
              { phase: 'Phase 2', label: 'Building', status: 'Unlocks after Phase 1', action: 'Start a ₹8K/month SIP', impact: '+6 score · Easy · Ongoing', color: 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900' },
              { phase: 'Phase 3', label: 'Growing', status: 'Unlocks after Phase 2', action: 'Optimise asset allocation for your age', impact: '+5 score · Medium · Ongoing', color: 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900' },
            ].map(p => (
              <div key={p.phase} className={`rounded-2xl border-2 p-5 ${p.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{p.phase} — {p.label}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === 'Active' ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>{p.status}</span>
                </div>
                <p className="font-bold text-sm text-gray-900 dark:text-white mb-2">{p.action}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{p.impact}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            7 · SAMPLE GOAL EXAMPLE
        ══════════════════════════════════════════════ */}
        <section>
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-2">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Turn any number into a target</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Goals with a real forecast, not a guess</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                Set a target from any calculator result or your score. We track your actual rate of progress and forecast a real completion date — and say nothing until there's enough real movement to trust.
              </p>
              <Link href="/goals" className="text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline">See the Goals system →</Link>
            </div>
            <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Example — illustrative, not a real user</p>
              <div className="space-y-5">
                {[
                  { icon: '🏦', label: 'Emergency fund', current: '₹1.4L', target: '₹96K target', pct: 100, note: 'Target already reached — separating into its own account is pending', badge: null },
                  { icon: '📈', label: 'Monthly SIP target', current: '₹6K', target: '₹8K target', pct: 75, note: '~2 months at this pace', badge: { label: 'On track', color: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400' } },
                  { icon: '🎯', label: 'WellFiLab Score target', current: '61', target: '75 target', pct: 40, note: '~5 months at this pace', badge: { label: 'Behind schedule', color: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400' } },
                ].map(g => (
                  <div key={g.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><span>{g.icon}</span>{g.label}</span>
                      <span className="font-mono tabular-nums text-[11px] text-gray-400">{g.current} <span className="text-gray-300 dark:text-gray-600">/</span> {g.target}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${g.pct}%` }} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] text-gray-400">{g.note}</p>
                      {g.badge && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${g.badge.color}`}>{g.badge.label}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            8 · SAMPLE DASHBOARD EXAMPLE
        ══════════════════════════════════════════════ */}
        <section>
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Everything, in one place</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">The dashboard you'll actually come back to</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Your score, your top priority, your risks, your goals, your net worth trend, and your roadmap progress — cross-linked, so nothing is a dead end.</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 sm:p-8">
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Score</p>
                <p className="font-mono tabular-nums text-2xl font-black text-teal-600 dark:text-teal-400">61<span className="text-xs text-gray-300">/100</span></p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 sm:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Today's top priority</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Build a 3-month emergency fund</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Risk alert</p>
                <p className="text-xs font-semibold text-red-600 dark:text-red-400">🛡️ No emergency fund</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Net worth</p>
                <p className="font-mono tabular-nums text-sm font-black text-gray-900 dark:text-white">₹18.4L <span className="text-emerald-600 dark:text-emerald-400 text-xs">+₹2.1L</span></p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Roadmap</p>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Phase 1 · 29% complete</p>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400">+ Goal progress, score history, achievements, and monthly review — all cross-linked on one page.</p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            9 · IMPROVEMENT JOURNEY EXAMPLE
        ══════════════════════════════════════════════ */}
        <section>
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">Why come back next month</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Progress you can actually see</h2>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <div className="flex items-end justify-between gap-2 mb-4">
              {[58, 64, 69, 75, 81].map((s, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="font-mono tabular-nums text-sm font-bold text-gray-900 dark:text-white">{s}</span>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden" style={{ height: 90 }}>
                    <div className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-lg" style={{ height: `${(s/81)*100}%`, marginTop: `${90 - (s/81)*90}px` }} />
                  </div>
                  <span className="text-[10px] text-gray-400">Month {i + 1}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              <span className="font-bold text-teal-600 dark:text-teal-400">+23 points in 5 months</span> — an emergency fund built, a SIP started, sleep debt closed. Every point traces back to a specific roadmap action completed, not a random fluctuation.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            10 · CALCULATOR ECOSYSTEM
        ══════════════════════════════════════════════ */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-1">Step 1 — Start Here</p>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{CALCULATORS.length}+ free tools. Use any. Your roadmap connects them.</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Each calculator result links to your score and roadmap automatically.</p>
            </div>
            <Link href="/tools" className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline flex-shrink-0">
              View all →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {([
              { calcs:health,  cat:'health'  as const, label:'Health',  icon:'🌿', grad:'from-teal-600 to-cyan-500' },
              { calcs:finance, cat:'finance' as const, label:'Finance', icon:'💰', grad:'from-amber-500 to-orange-500' },
            ]).map(({ calcs, cat, label, icon, grad }) => (
              <div key={cat} className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className={`bg-gradient-to-r ${grad} px-5 py-4 flex items-center justify-between`}>
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
            11 · GUIDES ECOSYSTEM
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
            12 · "SUCCESS STORIES" — honestly: real archetypes, not fabricated testimonials
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
              <div key={a.id} className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
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
            13 · FAQ
        ══════════════════════════════════════════════ */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Questions people actually ask</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-2">
            {FAQ.map((item, i) => (
              <details key={i} className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 border-l-4 border-l-transparent open:border-l-teal-500 overflow-hidden transition-colors">
                <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-sm text-gray-900 dark:text-gray-100 list-none">
                  {item.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform ml-3 flex-shrink-0">▾</span>
                </summary>
                <p className="px-4 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-gray-800 pt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            PLANS — kept as a secondary upsell, not the primary CTA
        ══════════════════════════════════════════════ */}
        <section className="rounded-3xl overflow-hidden">
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
        </section>

        {/* ══════════════════════════════════════════════
            14 · STRONG FINAL CTA
        ══════════════════════════════════════════════ */}
        <section className="text-center py-6">
          <p className="text-3xl mb-4">🎯</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">You know the problem now. Go see your number.</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8">
            5 minutes, real numbers, a score you can trust, and a roadmap that tells you exactly what to fix first. Free — no signup required to see it.
          </p>
          <Link href="/score"
            className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all">
            Get my free score →
          </Link>
        </section>

      </div>
    </div>
  );
}
