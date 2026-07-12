import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  title: `WellFiLab Score — ${SITE_NAME}`,
  description: 'Get your personalised WellFiLab Score. Answer 3 quick questions and get an instant score, archetype, and action plan connecting your health and your money.',
  alternates: { canonical: `${SITE_URL}/score` },
  openGraph: {
    title: `WellFiLab Score — ${SITE_NAME}`,
    description: 'Discover your archetype and see exactly how your health and finances connect. Free instant score with a personalised action plan.',
    type: 'website',
  },
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the WellFiLab Score?',
      acceptedAnswer: { '@type': 'Answer', text: 'A free assessment connecting your health and your finances — Body, Mind, Wealth, and Life. It gives you a score out of 100, a personal archetype, and a ranked action plan.' } },
    { '@type': 'Question', name: 'How long does it take?',
      acceptedAnswer: { '@type': 'Answer', text: 'The quick version is 3 questions and takes about 60 seconds. You can optionally add body and finance details afterward for a deeper, more accurate score — about 2 minutes each. Everything stays in your browser.' } },
    { '@type': 'Question', name: 'Is the WellFiLab Score free?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free, with no account needed to take it.' } },
    { '@type': 'Question', name: 'What happens after I complete it?',
      acceptedAnswer: { '@type': 'Answer', text: 'You get an instant score, your personal archetype, the specific ways your health and money connect, and the 3 highest-impact actions to take next.' } },
  ],
};

export default function ScoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      {children}
    </>
  );
}
