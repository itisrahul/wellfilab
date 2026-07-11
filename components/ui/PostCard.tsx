'use client';

import Link from 'next/link';
import type { Post } from '@/lib/types';

const TAG_BG: Record<string, string> = {
  'Weight Loss':'bg-teal-500', Nutrition:'bg-green-500', Sleep:'bg-indigo-500',
  'Body & Weight':'bg-teal-600', Fitness:'bg-blue-500', Investing:'bg-amber-500',
  Retirement:'bg-orange-500', Debt:'bg-red-500', SIP:'bg-amber-500',
  FIRE:'bg-red-500', Budgeting:'bg-emerald-500', Finance:'bg-amber-600',
  Health:'bg-teal-500', Lifestyle:'bg-purple-500', Mindset:'bg-purple-600',
};

export function PostCard({ post }: { post: Post; key?: any }) {
  const tagBg = TAG_BG[post.tag] ?? 'bg-gray-500';
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-teal-200 hover:shadow-sm transition-all group overflow-hidden">

      {/* Article link */}
      <Link href={`/guides/${post.slug}`} className="flex items-start gap-3 p-4 block">
        <span className="text-2xl flex-shrink-0 mt-0.5">{post.icon}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${tagBg}`}>{post.tag}</span>
            <span className="text-xs text-gray-400">{post.readTime} min</span>
          </div>
          <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors leading-snug">
            {post.title}
          </p>
        </div>
      </Link>

      {post.hwtCalc && (
        <Link href={post.hwtCalc.url?.startsWith('/') ? post.hwtCalc.url : `/tools/${post.hwtCalc.url?.replace(/https?:\/\/[^/]+\//, '') ?? ''}`}
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-1.5 px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors">
          🧮 {post.hwtCalc.label} →
        </Link>
      )}
    </div>
  );
}
