/**
 * components/ui/PlanUpsell.tsx
 *
 * Shows a plan upsell box at the bottom of every article.
 * Automatically picks diet vs finance plan based on category.
 *
 * Usage:
 *   <PlanUpsell category={post.category} />
 */
import Link from 'next/link';
import type { PostCategory } from '@/lib/types';

const HEALTH_CATS: PostCategory[] = ['health', 'nutrition'];

interface Props {
  category: PostCategory;
}

export function PlanUpsell({ category }: Props) {
  const isHealth = HEALTH_CATS.includes(category);
  const planSlug = isHealth ? 'diet' : 'finance';
  const icon     = isHealth ? '🥗' : '💰';
  const label    = isHealth ? 'diet' : 'finance';

  return (
    <div className="mt-10 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-2xl border border-teal-200 dark:border-teal-800 p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-bold text-teal-700 dark:text-teal-400 text-sm">
            Want a personalised {label} plan?
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Expert-crafted for your specific goals · From $9/month
          </p>
        </div>
      </div>
      <Link
        href={`/plans/${planSlug}`}
        className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
      >
        View plan details →
      </Link>
      <span className="ml-3 text-xs text-gray-400">No account required to browse</span>
    </div>
  );
}
