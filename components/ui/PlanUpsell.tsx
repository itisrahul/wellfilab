/**
 * components/ui/PlanUpsell.tsx
 *
 * Guide → plan connection, shown at the very bottom of every article.
 * "Ready to go beyond reading?" — Task 8 of the calculator→score→plan
 * journey spec.
 *
 * Usage:
 *   <PlanUpsell category={post.category} />
 */
import Link from 'next/link';
import type { PostCategory } from '@/lib/types';
import { PLANS_ENABLED } from '@/config/site';

export function PlanUpsell({ category: _category }: { category: PostCategory }) {
  if (!PLANS_ENABLED) return null;
  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-2xl border border-teal-200 dark:border-teal-800 p-6 text-center">
      <p className="font-bold text-gray-900 dark:text-white text-lg mb-1.5">Ready to go beyond reading?</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-1 max-w-md mx-auto">
        Get a personalised plan built around what you just read.
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5 max-w-md mx-auto">
        Created by an expert for your specific situation. Not a generic template.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/plan"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all">
          See plans from ₹149/month →
        </Link>
        <Link href="/score" className="text-sm font-semibold text-teal-700 dark:text-teal-400 hover:underline">
          Or check your score first →
        </Link>
      </div>
    </div>
  );
}
