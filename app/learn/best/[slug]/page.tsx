import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { COMPARISONS, getComparison } from '@/lib/comparisons';
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
 * more lib/comparisons.ts objects, not new page code. Structure matches the
 * spec: hero, top pick, every pick's pros/cons, a comparison table, the
 * editorial "why", FAQ, and a plain affiliate disclosure — never links
 * presented as if they were neutral.
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
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <Link href="/learn/best" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">← Comparisons & Best Picks</Link>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mt-3 mb-2">{post.category}</p>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{post.title}</h1>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">{post.dek}</p>
          <p className="text-[11px] text-gray-400 mt-4">Last checked {new Date(post.lastVerified).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} — confirm current pricing and features on each provider's own site before acting; details change.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* Top pick */}
        <section className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10 p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2">Top pick</p>
          <div className="flex items-start gap-4 flex-wrap">
            <span className="text-3xl flex-shrink-0">{topPick.logo}</span>
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{topPick.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{topPick.tagline}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2"><strong className="text-gray-700 dark:text-gray-300">Best for:</strong> {topPick.bestFor}</p>
            </div>
            <a href={topPick.url} target="_blank" rel="noopener noreferrer sponsored"
              className="flex-shrink-0 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-colors">
              {topPick.cta}
            </a>
          </div>
        </section>

        {/* All picks */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">All {post.picks.length} options, compared</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {post.picks.map(p => (
              <div key={p.id} className="rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-2xl">{p.logo}</span>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{p.name}</h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{p.tagline}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3"><strong>Best for:</strong> {p.bestFor}</p>
                <ul className="space-y-1 mb-2">
                  {p.pros.map(pro => <li key={pro} className="text-[12px] text-green-700 dark:text-green-400 flex gap-1.5"><span>+</span><span>{pro}</span></li>)}
                </ul>
                <ul className="space-y-1 mb-3">
                  {p.cons.map(con => <li key={con} className="text-[12px] text-gray-500 dark:text-gray-400 flex gap-1.5"><span>–</span><span>{con}</span></li>)}
                </ul>
                <a href={p.url} target="_blank" rel="noopener noreferrer sponsored" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">{p.cta}</a>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison table */}
        <section className="overflow-x-auto">
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
              {post.comparisonRows.map(row => (
                <tr key={row.label} className="border-b border-gray-100 dark:border-gray-800">
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
          {post.relatedCalcSlug && post.relatedCalcCat && (
            <Link href={`/tools/${post.relatedCalcCat}/${post.relatedCalcSlug}`} className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline">
              Run the calculator first →
            </Link>
          )}
          {post.relatedGuideSlug && (
            <Link href={`/guides/${post.relatedGuideSlug}`} className="inline-flex items-center gap-1.5 mt-3 ml-4 text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline">
              Read the full guide →
            </Link>
          )}
        </section>

        {/* FAQ */}
        <section>
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
          Some links on this page may earn WellFiLab a commission if you sign up through them — this never affects which provider is listed first or what's written about it. We'd write the same comparison either way.
        </p>
      </div>
    </div>
  );
}
