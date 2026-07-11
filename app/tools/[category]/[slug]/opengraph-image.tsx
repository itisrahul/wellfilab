import { getBySlug } from '@/config/tools';
import { renderOGImage, OG_SIZE, CATEGORY_GRADIENT } from '@/lib/ogImage';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'WellFiLab calculator';

// Rendered on-demand per request rather than pre-generated at build time —
// generateStaticParams here would force Next to prerender all ~60 images
// during `next build`, which is unnecessary build cost for images that only
// get fetched by link-preview crawlers (Vercel caches them after first hit).
export default async function Image({ params }: { params: { category: string; slug: string } }) {
  const calc = getBySlug(params.slug);
  return renderOGImage({
    icon: calc?.icon ?? '🧮',
    title: calc?.title ?? 'WellFiLab Calculator',
    subtitle: calc?.desc ?? 'Free calculator — instant results, no signup.',
    gradient: CATEGORY_GRADIENT[params.category] ?? CATEGORY_GRADIENT.health,
  });
}
