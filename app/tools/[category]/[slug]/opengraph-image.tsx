import { getBySlug, getAllSlugs } from '@/config/tools';
import { renderOGImage, OG_SIZE, CATEGORY_GRADIENT } from '@/lib/ogImage';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'WellFiLab calculator';

export async function generateStaticParams() {
  return getAllSlugs().map(({ category, slug }) => ({ category, slug }));
}

export default async function Image({ params }: { params: { category: string; slug: string } }) {
  const calc = getBySlug(params.slug);
  return renderOGImage({
    icon: calc?.icon ?? '🧮',
    title: calc?.title ?? 'WellFiLab Calculator',
    subtitle: calc?.desc ?? 'Free calculator — instant results, no signup.',
    gradient: CATEGORY_GRADIENT[params.category] ?? CATEGORY_GRADIENT.health,
  });
}
