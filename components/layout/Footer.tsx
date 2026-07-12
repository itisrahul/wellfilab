import Link from 'next/link';
import { SITE_NAME } from '@/config/site';

const EXPLORE_LINKS = [
  ['/tools',   'Tools'],
  ['/guides',  'Guides'],
  ['/score',   'WellFiLab Score'],
  ['/roadmap', 'Roadmap'],
  ['/plan',    'Plans & Pricing'],
];

const COMPANY_LINKS = [
  ['/about',          'About'],
  ['/contact',        'Contact'],
  ['/dashboard',      'Member Dashboard'],
  ['/privacy-policy', 'Privacy Policy'],
  ['/terms',           'Terms of Service'],
];

export function Footer() {
  return (
    <footer className="bg-gray-950 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-8">

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div className="md:col-span-2">
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
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Free health and finance calculators, evidence-based guides, and a personalised WellFiLab Score — for everyone, everywhere.
            </p>
          </div>

          {/* Explore */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Explore</p>
            <ul className="space-y-2.5">
              {EXPLORE_LINKS.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Company</p>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} {SITE_NAME} · Not medical or financial advice
          </p>
        </div>
      </div>
    </footer>
  );
}
