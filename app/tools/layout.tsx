import type { Metadata } from 'next';
import { CALCULATORS } from '@/config/tools';
import { SITE_NAME, SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  title: `${CALCULATORS.length}+ Free Calculators — ${SITE_NAME}`,
  description: `Free BMI, SIP/401k, mortgage, FIRE, calories, body fat, sleep and more. ${CALCULATORS.length} instant calculators. 15 currencies. No signup, no ads.`,
  alternates: { canonical: `${SITE_URL}/tools` },
  openGraph: {
    title: `${CALCULATORS.length}+ Free Health & Finance Calculators`,
    description: 'Every calculation runs in your browser. Instant results. No signup.',
    type: 'website',
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
