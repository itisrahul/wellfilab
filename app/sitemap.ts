import { CALCULATORS, getAllSlugs } from '@/config/tools';
import { ALL_POSTS } from '@/lib/posts';
import { SITE_URL } from '@/config/site';
const UPD = new Date('2025-06-18');
export default function sitemap() {
  return [
    { url: SITE_URL, changeFrequency: 'weekly' as const, priority: 1.0, lastModified: UPD },
    { url: `${SITE_URL}/tools`, changeFrequency: 'monthly' as const, priority: 0.9, lastModified: UPD },
    { url: `${SITE_URL}/guides`, changeFrequency: 'weekly' as const, priority: 0.9, lastModified: UPD },
    { url: `${SITE_URL}/score`, changeFrequency: 'monthly' as const, priority: 0.9, lastModified: UPD },
    { url: `${SITE_URL}/roadmap`, changeFrequency: 'weekly' as const, priority: 0.9, lastModified: new Date() },
    { url: `${SITE_URL}/goals`, changeFrequency: 'weekly' as const, priority: 0.8, lastModified: new Date() },
    { url: `${SITE_URL}/plan`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${SITE_URL}/compare`, changeFrequency: 'monthly' as const, priority: 0.7, lastModified: UPD },
    { url: `${SITE_URL}/about`, changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly' as const, priority: 0.4 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly' as const, priority: 0.3 },
    ...getAllSlugs().map(({ category, slug }) => ({
      url: `${SITE_URL}/tools/${category}/${slug}`,
      changeFrequency: 'monthly' as const, priority: 0.8, lastModified: UPD,
    })),
    ...ALL_POSTS.map(p => ({
      url: `${SITE_URL}/guides/${p.slug}`,
      changeFrequency: 'monthly' as const, priority: 0.7, lastModified: new Date(p.date),
    })),
  ];
}
