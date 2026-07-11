import { getPostBySlug, ALL_POSTS } from '@/lib/posts';
import { renderOGImage, OG_SIZE, CATEGORY_GRADIENT } from '@/lib/ogImage';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'WellFiLab guide';

export async function generateStaticParams() {
  return ALL_POSTS.map(p => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  return renderOGImage({
    icon: post?.icon ?? '📖',
    title: post?.title ?? 'WellFiLab Guide',
    subtitle: post?.excerpt ?? 'Evidence-based guides on health and personal finance.',
    gradient: CATEGORY_GRADIENT[post?.category ?? 'health'],
  });
}
