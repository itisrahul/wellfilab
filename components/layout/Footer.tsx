import Link from 'next/link';
import { SITE_NAME } from '@/config/site';

const COMPANY_LINKS = [
  ['/about',          'About'],
  ['/contact',        'Contact'],
  ['/plan',           'Plans & Pricing'],
  ['/dashboard',      'Member Dashboard'],
  ['/privacy-policy', 'Privacy Policy'],
  ['/terms',          'Terms of Service'],
];

export function Footer() {
  return (
    <footer className="bg-gray-950 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-8">

        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-4">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#0d9488"/>
            <path d="M5 9L10 23L16 14L22 23L27 9" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <span className="font-bold text-white text-sm block">{SITE_NAME}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Measure What Matters.</span>
          </div>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed mb-10 max-w-md">
          Free health and finance calculators, evidence-based guides, and a personalised Health-Wealth Score — for everyone, everywhere.
        </p>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {SITE_NAME} · Not medical or financial advice
          </p>
          <nav aria-label="Footer links" className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            {COMPANY_LINKS.map(([href, label]) => (
              <Link key={href} href={href} className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
