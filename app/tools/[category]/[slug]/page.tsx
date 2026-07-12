import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBySlug, getRelated, getAllSlugs } from '@/config/tools';
import { ToolRenderer }   from '@/components/tools/ToolRenderer';
import { ToolSEOContent } from '@/components/tools/ToolSEOContent';
import { PairWith }       from '@/components/tools/PairWith';
import { ExploreTools }   from '@/components/tools/ExploreTools';
import { EmbedButton }    from '@/components/tools/EmbedButton';
import { CalcHistory }    from '@/components/ui/CalcHistory';
import { ScoreCTA }       from '@/components/ui/ScoreCTA';
import { StructuredData, BreadcrumbSchema } from '@/components/ui/StructuredData';
import { SITE_NAME, SITE_URL } from '@/config/site';
import { ShareButton }   from '@/lib/shareResult';

export async function generateStaticParams() {
  return getAllSlugs().map(({ category, slug }) => ({ category, slug }));
}

export async function generateMetadata({ params }: { params: { category: string; slug: string } }): Promise<Metadata> {
  const c = getBySlug(params.slug);
  if (!c) return {};
  return {
    title: `${c.title} | ${SITE_NAME}`,
    description: c.metaDesc,
    keywords: c.tags,
    alternates: { canonical: `${SITE_URL}/tools/${c.category}/${c.slug}` },
    openGraph: { title: `${c.title} | ${SITE_NAME}`, description: c.metaDesc, type: 'website' },
  };
}

export default function ToolPage({ params }: { params: { category: string; slug: string } }) {
  const calc = getBySlug(params.slug);
  if (!calc) notFound();

  const related  = getRelated(params.slug, calc.category as any);
  const isHealth = calc.category === 'health';
  const pageUrl  = `${SITE_URL}/tools/${calc.category}/${calc.slug}`;

  const bar    = isHealth ? 'bg-gradient-to-r from-teal-500 to-cyan-500' : 'bg-gradient-to-r from-amber-500 to-orange-400';
  const accent = isHealth ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400';
  const tipDot = isHealth ? 'bg-teal-500' : 'bg-amber-500';
  const relBg  = isHealth
    ? 'bg-teal-50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-900'
    : 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900';

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <StructuredData slug={calc.slug} title={calc.title} desc={calc.metaDesc} url={pageUrl} />
      {calc.faq.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context':'https://schema.org','@type':'FAQPage',
          mainEntity: calc.faq.map(f=>({ '@type':'Question', name:f.q, acceptedAnswer:{'@type':'Answer',text:f.a} })),
        })}} />
      )}
      <BreadcrumbSchema items={[
        {name:'Home',url:SITE_URL},
        {name:'Tools',url:`${SITE_URL}/tools`},
        {name:calc.category.charAt(0).toUpperCase()+calc.category.slice(1),url:`${SITE_URL}/tools/${calc.category}`},
        {name:calc.short,url:pageUrl},
      ]} />

      <div className={`h-1 w-full ${bar}`} />

      <div className="max-w-5xl mx-auto px-4 py-6">

        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5 flex-wrap">
          <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-teal-600 transition-colors">Tools</Link>
          <span>/</span>
          <Link href={`/tools/${calc.category}`} className={`capitalize hover:underline ${accent}`}>{calc.category}</Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300 font-medium">{calc.short}</span>
        </nav>

        <div className="flex items-start gap-3 mb-6">
          <span className="text-4xl flex-shrink-0 leading-none mt-1">{calc.icon}</span>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 leading-snug">{calc.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{calc.desc}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mb-4">
          <ToolRenderer slug={params.slug} />
        </div>

        <div className="flex justify-end mb-6">
          <EmbedButton url={pageUrl} title={calc.title} />
        </div>

        {related.length > 0 && (
          <section className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">You might also like</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {related.slice(0, 3).map(t => (
                <Link key={t.slug} href={`/tools/${t.category}/${t.slug}`}
                  className={`flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-all group ${isHealth ? 'hover:border-teal-300 dark:hover:border-teal-700' : 'hover:border-amber-300 dark:hover:border-amber-700'}`}>
                  <span className="text-2xl flex-shrink-0">{t.icon}</span>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold text-gray-800 dark:text-gray-200 truncate ${isHealth ? 'group-hover:text-teal-600 dark:group-hover:text-teal-400' : 'group-hover:text-amber-600 dark:group-hover:text-amber-400'} transition-colors`}>
                      {t.short}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{t.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">

            {calc.wflTopics && calc.wflTopics.length > 0 && (
              <section className={`rounded-2xl border p-5 ${relBg}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${accent}`}>Related Guides</p>
                <div className="space-y-2">
                  {calc.wflTopics.map(topic => (
                    <Link key={topic.slug} href={`/guides/${topic.slug}`}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all group">
                      <span>📖</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">{topic.title}</span>
                      <span className={`text-xs font-semibold ${accent}`}>Read →</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {calc.content && (
              <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <ToolSEOContent calc={calc} />
              </section>
            )}

            {calc.tips.length > 0 && (
              <section>
                <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-3">💡 Expert Tips</h2>
                <div className="space-y-2">
                  {calc.tips.map((tip, i) => (
                    <div key={i} className="flex gap-3 p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                      <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5 ${tipDot}`}>{i+1}</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <PairWith calc={calc} />

            {calc.faq.length > 0 && (
              <section>
                <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Frequently Asked</h2>
                <div className="space-y-2">
                  {calc.faq.map((item, i) => (
                    <details key={i} className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                      <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-sm text-gray-900 dark:text-gray-100 list-none">
                        {item.q}
                        <span className="text-gray-400 group-open:rotate-180 transition-transform ml-3 flex-shrink-0">▾</span>
                      </summary>
                      <p className="px-4 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-gray-800 pt-3">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            <CalcHistory currentSlug={params.slug} />
            <ExploreTools related={related} />
          </div>

          <aside className="hidden lg:block sticky top-20 space-y-4">
            <ScoreCTA variant="compact" />
            {related.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Related Tools</p>
                <ul className="space-y-0.5">
                  {related.slice(0,10).map((t, i) => (
                    <li key={t.slug}>
                      <Link href={`/tools/${t.category}/${t.slug}`}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-teal-600 transition-colors group">
                        <span className="text-gray-300 dark:text-gray-600 font-mono text-[10px] w-4 flex-shrink-0">{i+1}.</span>
                        <span className="text-sm flex-shrink-0">{t.icon}</span>
                        <span className="truncate group-hover:underline">{t.short}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link href={`/tools/${calc.category}`}
              className={`block p-4 rounded-2xl border text-center hover:shadow-sm transition-all ${relBg}`}>
              <p className={`text-sm font-bold ${accent}`}>All {calc.category} tools →</p>
              <p className="text-xs text-gray-400 mt-1">
                {calc.category === 'health' ? '32 health calculators' : '28 finance calculators'}
              </p>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
