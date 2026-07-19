import Link from 'next/link';
import { getBySlug } from '@/config/tools';
import type { Calculator } from '@/config/tools';

/**
 * PairWith — renders the "Health ↔ Wealth" cross-category link block.
 *
 * This is the signature internal-linking feature of HealthWealthTools:
 * every calculator can point to 1–2 calculators in the OTHER category with
 * a short, original sentence explaining the connection. This:
 *  - creates topical, varied-anchor-text internal links across the whole site
 *    (good for crawl depth + PageRank flow between health/finance sections)
 *  - reinforces the site's unique "health and wealth are linked" positioning,
 *    which is the same idea WellFiLab's Score is built on
 */
export function PairWith({ calc }: { calc: Calculator }) {
  const pairs = (calc.pairWith ?? [])
    .map(p => ({ ...p, target: getBySlug(p.slug) }))
    .filter((p): p is typeof p & { target: Calculator } => p.target != null);

  if (pairs.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-orange-50 to-teal-50 dark:from-orange-950/15 dark:to-teal-950/15 rounded-2xl border border-orange-100 dark:border-orange-900/40 p-5">
      <h2 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-3">
        ⚖️ Health &amp; Wealth — pair this with
      </h2>
      <div className="space-y-2">
        {pairs.map(p => (
          <Link
            key={p.slug}
            href={`/tools/${p.target.category}/${p.target.slug}`}
            className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-sm transition-all group"
          >
            <span className="text-xl flex-shrink-0">{p.target.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {p.target.short}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                {p.reason}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
