import type { Metadata } from 'next';
import { ALL_POSTS } from '@/lib/posts';
import { SITE_NAME, SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  title: `Evidence-Based Health & Finance Guides — ${SITE_NAME}`,
  description: `${ALL_POSTS.length} guides on health, finance, nutrition and lifestyle. Every claim is sourced. Every number is verified. Written for a global audience.`,
  alternates: { canonical: `${SITE_URL}/guides` },
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
