import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { COMPARISONS, getComparison, overallRating } from '@/lib/comparisons';
import { Stars } from '@/components/ui/Stars';
import { ComparisonQuiz } from '@/components/learn/ComparisonQuiz';
import { SITE_NAME, SITE_URL } from '@/config/site';

export function generateStaticParams() {
  return COMPARISONS.map(c => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getComparison(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} (${new Date(post.lastVerified).getFullYear()}) | ${SITE_NAME}`,
    description: post.dek,
    alternates: { canonical: `${SITE_URL}/learn/best/${post.slug}` },
  };
}

/**
 * The comparison/best-picks article template — one real page
 * (best-investing-apps-india) proves the shape out; more entries are just
 * more lib/comparisons.ts objects, not new page code. Every pick gets its
 * own "best for X" badge and a real 3-axis star rating (see Stars +
 * overallRating), not just a single overall winner — more of the real
 * conversion surface for a goal-driven affiliate model, closer to how
 * NerdWallet structures a "best of" page than a flat ranked list.
 */
export default function ComparisonPage({ params }: { params: { slug: string } }) {
  const post = getComparison(params.slug);
  if (!post) notFound();

  const topPick = post.picks.find(p => p.id === post.topPickId) ?? post.picks[0];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: post.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }) }} />

      {/* Hero */}
      <div className="bg-gradient-to-b from-amber-50/60 to-white dark:from-amber-950/10 dark:to-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <Link href="/learn/best" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">← Comparisons & Best Picks</Link>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mt-3 mb-2">{post.category}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{post.title}</h1>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-2.5 max-w-2xl">{post.dek}</p>
          <div className="flex items-center gap-3 flex-wrap mt-5 text-[11px] text-gray-400">
            <span>Last checked {new Date(post.lastVerified).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>·</span>
            <Link href="/learn/best/methodology" className="underline hover:text-teal-600 dark:hover:text-teal-400">How we rate these</Link>
            <span>·</span>
            <Link href="/affiliate-disclosure" className="underline hover:text-teal-600 dark:hover:text-teal-400">Affiliate disclosure</Link>
          </div>

          {/* Jump nav */}
          <nav className="flex items-center gap-4 mt-6 text-xs font-semibold text-gray-500 dark:text-gray-400 overflow-x-auto">
            <a href="#picks" className="hover:text-amber-600 dark:hover:text-amber-400 whitespace-nowrap">Top picks</a>
            <a href="#compare" className="hover:text-amber-600 dark:hover:text-amber-400 whitespace-nowrap">Compare</a>
            <a href="#quiz" className="hover:text-amber-600 dark:hover:text-amber-400 whitespace-nowrap">Which one's for me?</a>
            <a href="#faq" className="hover:text-amber-600 dark:hover:text-amber-400 whitespace-nowrap">FAQ</a>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        {/* Top pick banner */}
        <section className="rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-950/10 p-6 relative overflow-hidden">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2">🏆 {topPick.badge}</p>
          <div className="flex items-start gap-4 flex-wrap">
            <span className="text-3xl flex-shrink-0 w-14 h-14 rounded-2xl bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 flex items-center justify-center">{topPick.logo}</span>
            <div className="flex-1 min-w-[220px]">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{topPick.name}</h2>
              <Stars value={overallRating(topPick.ratings)} />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{topPick.tagline}</p>
            </div>
            <a href={topPick.url} target="_blank" rel="noopener noreferrer sponsored"
              className="flex-shrink-0 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-colors">
              {topPick.cta}
            </a>
          </div>
        </section>

        {/* All picks */}
        <section id="picks" className="scroll-mt-20">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">All {post.picks.length} options, compared</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {post.picks.map(p => (
              <div key={p.id} id={`pick-${p.id}`} className="scroll-mt-20 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col">
                <span className="inline-flex self-start text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 mb-3">{p.badge}</span>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-xl w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">{p.logo}</span>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{p.name}</h3>
                </div>
                <Stars value={overallRating(p.ratings)} size={12} />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-3">{p.tagline}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3"><strong>Best for:</strong> {p.bestFor}</p>
                <ul className="space-y-1 mb-2">
                  {p.pros.map(pro => <li key={pro} className="text-[12px] text-green-700 dark:text-green-400 flex gap-1.5"><span>+</span><span>{pro}</span></li>)}
                </ul>
                <ul className="space-y-1 mb-4">
                  {p.cons.map(con => <li key={con} className="text-[12px] text-gray-500 dark:text-gray-400 flex gap-1.5"><span>–</span><span>{con}</span></li>)}
                </ul>
                <a href={p.url} target="_blank" rel="noopener noreferrer sponsored" className="mt-auto text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">{p.cta}</a>
              </div>
            ))}
          </div>
        </section>

        {/* Quiz */}
        {post.quiz && (
          <section id="quiz" className="scroll-mt-20">
            <ComparisonQuiz quiz={post.quiz} picks={post.picks} />
          </section>
        )}

        {/* Comparison table */}
        <section id="compare" className="scroll-mt-20 overflow-x-auto">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Side by side</h2>
          <table className="w-full text-sm border-collapse min-w-[480px]">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="text-left py-2.5 pr-4 text-xs font-bold text-gray-400 uppercase tracking-wide"></th>
                {post.picks.map(p => (
                  <th key={p.id} className="text-left py-2.5 px-4 text-xs font-bold text-gray-700 dark:text-gray-300">{p.logo} {p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2.5 pr-4 text-xs font-semibold text-gray-500 dark:text-gray-400">Rating</td>
                {post.picks.map(p => (
                  <td key={p.id} className="py-2.5 px-4"><Stars value={overallRating(p.ratings)} size={12} /></td>
                ))}
              </tr>
              {post.comparisonRows.map((row, i) => (
                <tr key={row.label} className={`border-b border-gray-100 dark:border-gray-800 ${i % 2 === 1 ? 'bg-gray-50/60 dark:bg-gray-900/40' : ''}`}>
                  <td className="py-2.5 pr-4 text-xs font-semibold text-gray-500 dark:text-gray-400">{row.label}</td>
                  {post.picks.map(p => (
                    <td key={p.id} className="py-2.5 px-4 text-xs text-gray-700 dark:text-gray-300">{row.values[p.id] ?? '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Why we recommend */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Why these three, and how to actually choose</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{post.whyWeRecommend}</p>
          <div className="flex flex-wrap gap-4 mt-3">
            {post.relatedCalcSlug && post.relatedCalcCat && (
              <Link href={`/tools/${post.relatedCalcCat}/${post.relatedCalcSlug}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline">
                Run the calculator first →
              </Link>
            )}
            {post.relatedGuideSlug && (
              <Link href={`/guides/${post.relatedGuideSlug}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline">
                Read the full guide →
              </Link>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Questions people ask</h2>
          <div className="max-w-2xl">
            {post.faq.map((item, i) => (
              <details key={i} className="group border-b border-gray-100 dark:border-gray-800 py-3">
                <summary className="flex items-center justify-between gap-4 font-semibold text-sm text-gray-900 dark:text-white cursor-pointer list-none">
                  {item.q}
                  <span className="text-gray-400 text-lg font-light group-open:rotate-45 transition-transform flex-shrink-0">+</span>
                </summary>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Disclosure */}
        <p className="text-[11px] text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-5">
          Some links on this page may earn WellFiLab a commission if you sign up through them — this never affects which provider is listed first, its rating, or what's written about it. See our <Link href="/affiliate-disclosure" className="underline hover:text-teal-600 dark:hover:text-teal-400">full disclosure</Link>.
        </p>
      </div>
    </div>
  );
}
