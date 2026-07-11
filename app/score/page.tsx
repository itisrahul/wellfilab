import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ScoreApp } from './ScoreApp';
import { SITE_NAME, SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  title: `Health-Wealth Score — ${SITE_NAME}`,
  description: 'Get your personalised Health-Wealth Balance Score. Answer 24 questions across 6 life dimensions and get an instant score, analysis, and action plan.',
  alternates: { canonical: `${SITE_URL}/score` },
  openGraph: {
    title: `Health-Wealth Score — ${SITE_NAME}`,
    description: 'Discover how balanced your health and finances really are. Free instant score with personalised action plan.',
    type: 'website',
  },
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the Health-Wealth Score?',
      acceptedAnswer: { '@type': 'Answer', text: 'A free assessment across 6 life dimensions — Body Health, Nutrition, Mental Wellness, Savings, Debt, and Financial Future. It gives you a score out of 100 with a personalised action plan.' } },
    { '@type': 'Question', name: 'How long does it take?',
      acceptedAnswer: { '@type': 'Answer', text: '24 questions, approximately 5 minutes. Your answers stay in your browser — nothing is stored or sent to any server.' } },
    { '@type': 'Question', name: 'Is the Health-Wealth Score free?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free, with no account needed to take the quiz. After you see your results, you can optionally enter your email for a 90-day check-in reminder — this is entirely optional and the score itself never requires it.' } },
    { '@type': 'Question', name: 'What happens after I complete the assessment?',
      acceptedAnswer: { '@type': 'Answer', text: 'You get an instant score, dimension breakdown, personalised action plan with the 4 most impactful changes you can make, and article recommendations matched to your weakest areas.' } },
  ],
};

export default function ScorePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      <Suspense fallback={null}>
        <ScoreApp />
      </Suspense>
    </>
  );
}
