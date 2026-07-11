import { getPostBySlug } from '@/lib/posts';
import { renderOGImage, OG_SIZE, CATEGORY_GRADIENT } from '@/lib/ogImage';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'WellFiLab guide';

// Rendered on-demand per request rather than pre-generated at build time —
// see app/tools/[category]/[slug]/opengraph-image.tsx for why.
export default async function Image({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  return renderOGImage({
    icon: post?.icon ?? '📖',
    title: post?.title ?? 'WellFiLab Guide',
    subtitle: post?.excerpt ?? 'Evidence-based guides on health and personal finance.',
    gradient: CATEGORY_GRADIENT[post?.category ?? 'health'],
  });
}
