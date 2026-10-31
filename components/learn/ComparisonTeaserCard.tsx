import Link from 'next/link';
import type { ComparisonPost } from '@/lib/comparisons';
import { overallRating } from '@/lib/comparisons';
import { Stars } from '@/components/ui/Stars';

/** The comparison-article teaser card — shared by /learn and /learn/best
 * so adding a provider logo/rating treatment only needs to happen once. */
export function ComparisonTeaserCard({ post }: { post: ComparisonPost }) {
  const topPick = post.picks.find(p => p.id === post.topPickId) ?? post.picks[0];
  return (
    <Link href={`/learn/best/${post.slug}`}
      className="block p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800 hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">{post.category}</p>
        <Stars value={overallRating(topPick.ratings)} size={12} />
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1.5">{post.title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{post.dek}</p>
      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-3">🏆 Top pick: {topPick.name}</p>
    </Link>
  );
}
