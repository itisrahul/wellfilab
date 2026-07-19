import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getRelatedPosts, ALL_POSTS } from '@/lib/posts';
import { ArticleBody }  from '@/components/ui/ArticleBody';
import { PlanUpsell }   from '@/components/ui/PlanUpsell';
import { RelatedPosts } from '@/components/ui/RelatedPosts';
import { SITE_NAME, SITE_URL } from '@/config/site';
import { ArticleShare } from '@/components/ui/ArticleShare';

// ─── Constants ────────────────────────────────────────────────────────────────
const TAG_BG: Record<string, string> = {
  'Weight Loss': 'bg-teal-500',  Nutrition:  'bg-green-500',
  'Body & Weight': 'bg-teal-600', Fitness:   'bg-blue-500',
  Sleep:         'bg-indigo-500', Investing: 'bg-amber-500',
  Retirement:    'bg-orange-500', Debt:      'bg-red-500',
  SIP:           'bg-amber-500',  FIRE:      'bg-red-500',
  Budgeting:     'bg-emerald-500', Finance:  'bg-amber-500',
  Health:        'bg-teal-500',   Lifestyle: 'bg-purple-500',
};

const ACCENT: Record<string, string> = {
  health:    'bg-gradient-to-r from-teal-400   to-cyan-400',
  finance:   'bg-gradient-to-r from-amber-400  to-orange-400',
  nutrition: 'bg-gradient-to-r from-green-400  to-emerald-400',
  lifestyle: 'bg-gradient-to-r from-purple-400 to-pink-400',
};

// ─── Static params + Metadata ─────────────────────────────────────────────────
export function generateStaticParams() {
  return ALL_POSTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title:       post.title,
    description: post.excerpt,
    keywords:    post.tags,
    alternates:  { canonical: `${SITE_URL}/guides/${post.slug}` },
    openGraph:   { title: post.title, description: post.excerpt, type: 'article' },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const related       = getRelatedPosts(params.slug, post.category);
  const dateStr       = new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const tagBg         = TAG_BG[post.tag] ?? 'bg-gray-500';
  const calcPillClass = post.category === 'finance' ? 'calc-pill-finance' : 'calc-pill';

  const schema = {
    '@context':      'https://schema.org',
    '@type':         'Article',
    headline:        post.title,
    description:     post.excerpt,
    datePublished:   post.date,
    dateModified:    post.date,
    author:          { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher:       { '@type': 'Organization', name: SITE_NAME, url: SITE_URL,
                       logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon-512.png` } },
    mainEntityOfPage:{ '@type': 'WebPage', '@id': `${SITE_URL}/guides/${post.slug}` },
    keywords:        post.tags.join(', '),
    articleSection:  post.category,
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Category colour bar */}
      <div className={`h-1 w-full ${ACCENT[post.category] ?? ACCENT.health}`} />

      <article className="max-w-6xl mx-auto px-4 py-12 md:py-16">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 flex items-center gap-1.5 mb-8">
          <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-200">Home</Link>
          <span>/</span>
          <Link href={`/blog?category=${post.category}`} className="hover:text-gray-600 dark:hover:text-gray-200 capitalize">{post.category}</Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300 truncate font-medium">{post.tag}</span>
        </nav>

        {/* Tag + date + read time */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md text-white ${tagBg}`}>{post.tag}</span>
          <span className="text-xs text-gray-400">{dateStr}</span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-400">{post.readTime} min read</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-snug mb-5">
          {post.icon} {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-8 border-l-4 border-gray-200 dark:border-gray-700 pl-5 italic">
          {post.excerpt}
        </p>

        {/* Calculator pill — top of article */}
        {post.hwtCalc && (
          <div className="mb-8">
            <a href={post.hwtCalc.url} target="_blank" rel="noopener noreferrer" className={calcPillClass}>
              🧮 {post.hwtCalc.label} ↗
            </a>
          </div>
        )}

        {/* Article body — extracted to its own component */}
        <ArticleBody sections={post.body} hwtCalc={post.hwtCalc} calcPillClass={calcPillClass} />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>

        {/* Share */}
        <ArticleShare title={post.title} url={`${SITE_URL}/guides/${post.slug}`} />

        {/* Plan upsell — extracted to its own component */}
        <PlanUpsell category={post.category} />

      </article>

      {/* Related posts — extracted to its own component */}
      <RelatedPosts posts={related} category={post.category} />

      {/* HWT cross-link — drives traffic between sites */}
      {post.hwtCalc && (
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-500 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center gap-4">
            <div className="text-3xl flex-shrink-0">🧮</div>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-bold text-sm mb-0.5">Try the free calculator</p>
              <p className="text-teal-100 text-xs">{post.hwtCalc.label} — instant results, no signup</p>
            </div>
            <a href={post.hwtCalc.url} target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 px-5 py-2.5 bg-white text-teal-700 font-bold rounded-xl text-sm hover:bg-teal-50 transition-all">
              Open Calculator ↗
            </a>
          </div>
        </section>
      )}

    </div>
  );
}
