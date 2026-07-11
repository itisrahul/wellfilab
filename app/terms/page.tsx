import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/config/site';
export const metadata: Metadata = {
  title: `Terms of Service — ${SITE_NAME}`,
  alternates: { canonical: `${SITE_URL}/terms` },
};
export default function TermsPage() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-14">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: 18 June 2025</p>
        <div className="space-y-8 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {[
            ['1. Acceptance', 'By using WellFiLab you agree to these terms. If you disagree, please do not use the site.'],
            ['2. Informational only', 'All content is for informational purposes only. WellFiLab does not provide medical, financial, or legal advice. Calculator results are estimates. Consult a qualified professional before making health or financial decisions.'],
            ['3. Free tools', 'Calculators, guides, and the Score are provided free of charge. We may modify or discontinue any free feature at any time.'],
            ['4. Paid plans', 'Subscriptions are billed in advance. Cancel any time. First-time subscribers get a 30-day money-back guarantee.'],
            ['5. Intellectual property', 'All content is owned by WellFiLab. Do not reproduce, distribute, or create derivative works without written permission.'],
            ['6. Limitation of liability', 'WellFiLab is not liable for indirect, incidental, or consequential damages arising from your use of the site.'],
            ['7. Governing law', 'These terms are governed by the laws of India.'],
            ['8. Contact', 'Questions? Email legal@wellfilab.com'],
          ].map(([title, body]) => (
            <section key={title as string}>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h2>
              <p>{body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
