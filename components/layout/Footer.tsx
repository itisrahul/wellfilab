import Link from 'next/link';
import { SITE_NAME } from '@/config/site';
import { ALL_POSTS } from '@/lib/posts';

const TOOL_LINKS = [
  ['/tools/health/bmi',        'BMI Calculator'],
  ['/tools/health/calories',   'Calorie / BMR'],
  ['/tools/health/body-fat',   'Body Fat %'],
  ['/tools/health/sleep',      'Sleep Cycle'],
  ['/tools/finance/sip',       'SIP Calculator'],
  ['/tools/finance/loan',      'Loan / EMI'],
  ['/tools/finance/retirement','Retirement'],
  ['/tools/finance/income-tax','Income Tax'],
  ['/tools/finance/fire',      'FIRE Calculator'],
];

const COMPANY_LINKS = [
  ['/about',          'About'],
  ['/contact',        'Contact'],
  ['/plan',           'Plans & Pricing'],
  ['/dashboard',      'Member Dashboard'],
  ['/privacy-policy', 'Privacy Policy'],
  ['/terms',          'Terms of Service'],
];

const CATS = ['health','finance','nutrition','lifestyle'] as const;
const CAT_ICON: Record<string,string> = { health:'💪', finance:'💰', nutrition:'🥗', lifestyle:'🌿' };

export function Footer() {
  return (
    <footer className="bg-gray-950 mt-16">
      {/* Main grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2">
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
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Free health and finance calculators, evidence-based guides, and a personalised Health-Wealth Score — for everyone, everywhere.
            </p>

            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2.5">Popular Tools</p>
            <ul className="space-y-1.5">
              {TOOL_LINKS.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Article columns */}
          {CATS.map(cat => (
            <div key={cat}>
              <h3 className="text-sm font-semibold text-gray-300 mb-3 capitalize flex items-center gap-1.5">
                <span>{CAT_ICON[cat]}</span> {cat}
              </h3>
              <ul className="space-y-2">
                {ALL_POSTS.filter(p => p.category === cat).slice(0, 5).map(p => (
                  <li key={p.slug}>
                    <Link href={`/guides/${p.slug}`}
                      className="text-sm text-gray-400 hover:text-gray-200 transition-colors leading-snug block">
                      {p.title}
                    </Link>
                  </li>
                ))}
                <li className="pt-1">
                  <Link href={`/guides?category=${cat}`}
                    className="text-sm text-teal-500 hover:text-teal-300 font-semibold transition-colors">
                    All {cat} →
                  </Link>
                </li>
              </ul>
            </div>
          ))}
        </div>

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
