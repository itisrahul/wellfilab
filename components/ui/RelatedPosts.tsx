/**
 * components/ui/RelatedPosts.tsx
 *
 * Shows related articles at the bottom of a blog post.
 *
 * Usage:
 *   <RelatedPosts posts={related} category={post.category} />
 */
import Link from 'next/link';
import type { Post } from '@/lib/types';

const TAG_BG: Record<string, string> = {
  'Weight Loss': 'bg-teal-500', Nutrition: 'bg-green-500',
  'Body & Weight': 'bg-teal-600', Fitness: 'bg-blue-500',
  Sleep: 'bg-indigo-500', Investing: 'bg-amber-500',
  Retirement: 'bg-orange-500', Debt: 'bg-red-500',
  SIP: 'bg-amber-500', FIRE: 'bg-red-500',
  Budgeting: 'bg-emerald-500', Finance: 'bg-amber-500',
  Health: 'bg-teal-500', Lifestyle: 'bg-purple-500',
};

interface Props {
  posts: Post[];
  category: string;
}

export function RelatedPosts({ posts, category }: Props) {
  if (!posts.length) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 pb-16">
      <h2 className="font-bold text-base text-gray-800 dark:text-gray-200 mb-4 capitalize">
        More {category} articles
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {posts.map(p => (
          <Link
            key={p.slug}
            href={`/guides/${p.slug}`}
            className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-teal-200 hover:shadow-sm transition-all group"
          >
            <span className="text-2xl flex-shrink-0">{p.icon}</span>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${TAG_BG[p.tag] ?? 'bg-gray-500'
                    }`}
                >
                  {p.tag}
                </span>

                <span className="text-xs text-gray-400">
                  {p.readTime} min
                </span>
              </div>

              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors leading-snug">
                {p.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
