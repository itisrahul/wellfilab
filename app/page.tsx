import type { Metadata } from 'next';
import Link from 'next/link';
import { CALCULATORS, getByCategory } from '@/config/tools';
import { ALL_POSTS } from '@/lib/posts';
import { PostCard } from '@/components/ui/PostCard';
import { NewsletterSignup } from '@/components/ui/NewsletterSignup';
import { SITE_NAME, SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  title: `${SITE_NAME} — Free Health & Finance Tools, Guides & Score`,
  description: `${CALCULATORS.length}+ free calculators, evidence-based guides, and a personalised WellFiLab Score. No signup. 100% private.`,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: `${SITE_NAME} — A Better Life Starts Here.`,
    description: `${CALCULATORS.length}+ free health & finance calculators — BMI, SIP, EMI, FIRE, calories, sleep and more.`,
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

export default function HomePage() {
  const health  = getByCategory('health').filter(c => c.popular).slice(0, 6);
  const finance = getByCategory('finance').filter(c => c.popular).slice(0, 6);
  const latest  = [...ALL_POSTS]
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="bg-white dark:bg-gray-950">

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-500">
        {/* dot grid texture */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}/>
        {/* bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/10 to-transparent"/>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Measure What Matters.
          </h1>

          {/* Sub */}
          <p className="text-teal-100/85 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            We look at your health and finances together and build you a personalised step-by-step roadmap. Free. Takes 60 seconds.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link href="/score"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-teal-800 font-extrabold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all">
              Get my free roadmap →
            </Link>
            <Link href="/tools"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-base border-2 border-white/30 hover:border-white/50 transition-all">
              Browse {CALCULATORS.length}+ free tools →
            </Link>
          </div>

          {/* Popular tools — bigger cards */}
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
            HOW IT WORKS
        ══════════════════════════════════════════════ */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2 text-center">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">From confused to clear — in minutes</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: '01', icon: '🧮', title: 'Use free tools',           desc: `${CALCULATORS.length}+ instant calculators for health and finance. No signup.` },
              { n: '02', icon: '⭐', title: 'Enter your real numbers',  desc: 'Age, weight, sleep, income — your score is calculated from your actual data.' },
              { n: '03', icon: '🗺️', title: 'Get your roadmap',         desc: 'A personalised step-by-step plan. What to fix first, second, third — and which tools to use.' },
              { n: '04', icon: '📈', title: 'Track and improve',        desc: 'Come back monthly. Your roadmap updates as your score improves.' },
            ].map((s, i, arr) => (
              <div key={s.n} className="relative p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-center">
                {i < arr.length - 1 && (
                  <span className="hidden lg:block absolute top-1/2 -right-2.5 -translate-y-1/2 text-gray-300 dark:text-gray-700 text-lg">→</span>
                )}
                <p className="text-3xl font-black text-teal-600 opacity-30 mb-1">{s.n}</p>
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="font-bold text-sm text-gray-900 dark:text-white mb-1">{s.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SCORE — dramatic, full-width feature card
        ══════════════════════════════════════════════ */}
        <section>
          <Link href="/score" className="group block">
            <div className="relative overflow-hidden rounded-3xl bg-gray-950 dark:bg-gray-900 p-8 md:p-12 hover:shadow-2xl transition-all duration-300">

              {/* Background glow */}
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none"/>
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"/>

              <div className="relative grid md:grid-cols-2 gap-10 items-center">
                {/* Left */}
                <div>
                  <div className="flex items-center gap-2.5 mb-5">
                    <span className="flex items-center gap-1.5 text-xs font-bold bg-teal-500 text-white px-3 py-1.5 rounded-full uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>
                      Free · No signup needed
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                    Your health and money<br/>are more connected than you think.
                  </h2>
                  <p className="text-gray-400 leading-relaxed mb-8 text-base">
                    WellFiLab looks at both together and shows you exactly what to fix first — with a personalised step-by-step roadmap based on your actual numbers. Not self-ratings. Not guesses. Your data.
                  </p>

                  <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-teal-500 group-hover:bg-teal-400 text-white font-bold text-sm transition-all group-hover:shadow-lg group-hover:shadow-teal-500/30">
                    Get my free roadmap →
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </div>
                </div>

                {/* Right — dimension cards */}
                <div>
                  <div className="grid grid-cols-2 gap-3">
                    {SCORE_DIMS.map((d, i) => (
                      <div key={d.label}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
                        <div className={`w-8 h-8 rounded-lg ${d.color} flex items-center justify-center text-base flex-shrink-0`}>
                          {d.icon}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-xs">{d.label}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_,j) => (
                              <div key={j} className={`h-1 w-4 rounded-full ${j < (i % 3) + 2 ? d.color.replace('bg-','bg-') : 'bg-white/15'}`}/>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Stats row */}
                  <div className="mt-4 pt-4 border-t border-white/10 text-center">
                    <p className="text-xs text-gray-400">Real inputs · Based on your data · Free · Always · Roadmap included</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* ══════════════════════════════════════════════
            TOOLS
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
                {/* Header strip */}
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
                {/* Tool rows */}
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
            GUIDES
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
            WHY WELLFILAB
        ══════════════════════════════════════════════ */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">Why WellFiLab</h2>
          <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon:'🔗', title:'Health and money together', body:'Most apps fix one or the other. WellFiLab is the only tool that shows how they connect — and what that connection costs you.' },
            { icon:'📊', title:'Your actual numbers',        body:'Enter your real data — sleep hours, income, weight. Your score is calculated from your actual numbers, not self-ratings or averages.' },
            { icon:'🗺️', title:'A roadmap, not just a number', body:'Most tools stop at a score and leave you guessing. WellFiLab tells you what to fix first, second, and third — free, no plan required.' },
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
            PLANS
        ══════════════════════════════════════════════ */}
        <section className="rounded-3xl overflow-hidden">
          <div className="bg-gray-950 p-10 md:p-14">
            <div className="grid md:grid-cols-5 gap-10 items-center">
              <div className="md:col-span-3">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3">Personalised Plans</p>
                <h2 className="text-3xl font-extrabold text-white mb-4 leading-snug">
                  Beyond the calculator.
                </h2>
                <p className="text-gray-400 leading-relaxed mb-8 text-sm max-w-sm">
                  Free tools show you the numbers. Our expert-crafted plans tell you exactly what to do with them.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/plan"
                    className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all">
                    View Plans & Pricing →
                  </Link>
                  <Link href="/score"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 text-sm transition-all">
                    Start with free Score
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

      </div>
    </div>
  );
}
