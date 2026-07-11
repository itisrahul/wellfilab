/**
 * lib/posts.ts — Central post registry
 *
 * HOW TO ADD A NEW POST:
 *   1. Create /content/{category}/your-slug.ts  (copy any file as template)
 *   2. Add it to /content/{category}/index.ts imports + array
 *   3. Done — sitemap, search, blog pages all update automatically
 *
 * HOW TO ADD A NEW CATEGORY:
 *   1. Create /content/{newcat}/your-first-post.ts
 *   2. Create /content/{newcat}/index.ts  (copy any index.ts as template)
 *   3. Import and spread it here
 *   4. Add the new value to PostCategory in lib/types.ts
 */
import type { Post, PostCategory } from './types';

import healthPosts    from '@/content/health/index';
import financePosts   from '@/content/finance/index';
import nutritionPosts from '@/content/nutrition/index';
import lifestylePosts from '@/content/lifestyle/index';

export type { Post, PostCategory };

export const ALL_POSTS: Post[] = [
  ...healthPosts,
  ...financePosts,
  ...nutritionPosts,
  ...lifestylePosts,
];

export const getPostBySlug   = (slug: string)              => ALL_POSTS.find(p => p.slug === slug) ?? null;
export const getByCategory   = (cat: PostCategory)         => ALL_POSTS.filter(p => p.category === cat);
export const getFeatured     = (n = 6)                     => ALL_POSTS.slice(0, n);
export const getRelatedPosts = (slug: string, cat: PostCategory) =>
  ALL_POSTS.filter(p => p.slug !== slug && p.category === cat).slice(0, 4);
export const searchPosts = (q: string) => {
  const lower = q.toLowerCase().trim();
  if (!lower) return [];
  return ALL_POSTS.filter(p =>
    p.title.toLowerCase().includes(lower) ||
    p.excerpt.toLowerCase().includes(lower) ||
    p.tags.some(t => t.toLowerCase().includes(lower))
  );
};
