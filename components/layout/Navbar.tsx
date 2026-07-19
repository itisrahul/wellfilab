'use client';
import { useState, useRef, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { useClerkAppearance } from '@/lib/clerkAppearance';
import { CALCULATORS, getGroups, type Category } from '@/config/tools';
import { ALL_POSTS } from '@/lib/posts';
import { PLANS_ENABLED } from '@/config/site';

type Hit =
  | { kind: 'tool'; slug: string; cat: string; icon: string; label: string; desc: string }
  | { kind: 'post'; slug: string; cat: string; icon: string; label: string; excerpt: string };

const TOOL_IDX: Hit[] = CALCULATORS.map(c => ({ kind:'tool' as const, slug:c.slug, cat:c.category, icon:c.icon, label:c.short, desc:c.desc }));
const POST_IDX: Hit[] = ALL_POSTS.map(p => ({ kind:'post' as const, slug:p.slug, cat:p.category, icon:p.icon, label:p.title, excerpt:p.excerpt }));

function runSearch(q: string): Hit[] {
  if (q.length < 2) return [];
  const t = q.toLowerCase();
  return [
    ...TOOL_IDX.filter(h => h.label.toLowerCase().includes(t) || (h as any).desc?.toLowerCase().includes(t)).slice(0, 5),
    ...POST_IDX.filter(h => h.label.toLowerCase().includes(t)).slice(0, 3),
  ];
}

const Logo = memo(function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 flex-shrink-0" aria-label="WellFiLab home">
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <rect width="34" height="34" rx="9" fill="#0d9488"/>
        <path d="M6 10L10 24L17 15L24 24L28 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div className="leading-none">
        <span className="block font-bold text-[15px] tracking-tight text-gray-900 dark:text-white">WellFiLab</span>
        <span className="block text-[10px] text-gray-500 dark:text-gray-400 tracking-widest uppercase mt-0.5">Measure What Matters.</span>
      </div>
    </Link>
  );
});

const SearchOverlay = memo(function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ]     = useState('');
  const [idx, setIdx] = useState(0);
  const hits           = runSearch(q);
  const router         = useRouter();
  const inputRef       = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const go = useCallback((h: Hit) => {
    router.push(h.kind === 'tool' ? `/tools/${h.cat}/${h.slug}` : `/guides/${h.slug}`);
    onClose();
  }, [router, onClose]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i+1, hits.length-1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(i-1, 0)); }
    if (e.key === 'Enter' && hits[idx]) go(hits[idx]);
    if (e.key === 'Escape') onClose();
  };

  const CAT_COLOR: Record<string, string> = {
    health:   'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200',
    finance:  'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
    nutrition:'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    lifestyle:'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  };

  return (
    <div className="absolute inset-x-0 top-full z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-2xl">
      <div className="max-w-xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-teal-500 dark:border-teal-400 rounded-xl">
          <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input ref={inputRef} type="search" value={q}
            onChange={e => { setQ(e.target.value); setIdx(0); }}
            onKeyDown={handleKey}
            placeholder={`Search ${CALCULATORS.length} tools and ${ALL_POSTS.length} guides…`}
            className="flex-1 min-w-0 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
            aria-label="Search" aria-autocomplete="list" aria-expanded={hits.length > 0}
          />
          <button onClick={onClose} aria-label="Close search"
            className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0">
            Esc
          </button>
        </div>

        {hits.length > 0 && (
          <div role="listbox" className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg divide-y divide-gray-100 dark:divide-gray-700">
            {hits.map((h, i) => (
              <button key={`${h.kind}-${h.slug}`} role="option" aria-selected={i === idx}
                onClick={() => go(h)} onMouseEnter={() => setIdx(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${i === idx ? 'bg-teal-50 dark:bg-teal-950/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                <span className="text-xl flex-shrink-0">{h.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{h.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {'desc' in h ? (h as any).desc : (h as any).excerpt}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${CAT_COLOR[h.cat] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                  {h.kind === 'tool' ? 'Tool' : 'Guide'}
                </span>
              </button>
            ))}
          </div>
        )}

        {q.length >= 2 && hits.length === 0 && (
          <div className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-5 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">No results for <strong className="text-gray-900 dark:text-white">"{q}"</strong></p>
            <Link href="/tools" onClick={onClose} className="mt-2 inline-block text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline">
              Browse all {CALCULATORS.length} tools →
            </Link>
          </div>
        )}

        {q.length < 2 && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center pb-1">
            Try "BMI", "SIP", "calories", "FIRE" or "sleep"
          </p>
        )}
      </div>
    </div>
  );
});

// Capped so a hover menu stays scannable no matter how large the catalog
// grows — a group that outgrows this links to its full category page
// instead of pushing the dropdown's height past the viewport.
const MAX_PER_GROUP = 5;

function MegaGroup({ group, calcs, category, accentDot, onClose }: {
  group: string; calcs: typeof CALCULATORS; category: 'health' | 'finance'; accentDot: string; onClose: () => void;
}) {
  const shown = calcs.slice(0, MAX_PER_GROUP);
  const extra = calcs.length - shown.length;
  return (
    <div className="mb-5 break-inside-avoid">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">{group}</p>
      {shown.map(c => (
        <Link key={c.slug} href={`/tools/${category}/${c.slug}`} onClick={onClose}
          className="flex items-center gap-2 py-1.5 px-2 -mx-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <span className="text-base w-5 text-center flex-shrink-0">{c.icon}</span>
          <span className="truncate">{c.short}</span>
          {c.popular && <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accentDot }}/>}
        </Link>
      ))}
      {extra > 0 && (
        <Link href={`/tools/${category}`} onClick={onClose}
          className="flex items-center gap-2 py-1.5 px-2 -mx-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <span className="w-5 flex-shrink-0"/>+{extra} more →
        </Link>
      )}
    </div>
  );
}

const ToolsMegaMenu = memo(function ToolsMegaMenu({ onClose }: { onClose: () => void }) {
  const hGroups = getGroups('health');
  const fGroups = getGroups('finance');
  return (
    <div className="absolute inset-x-0 top-full z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-2xl" onMouseLeave={onClose}>
      <div className="max-w-7xl mx-auto px-6 py-7 max-h-[calc(100vh-5rem)] overflow-y-auto">
        <div className="grid grid-cols-2 gap-10">

          {/* Health */}
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Health Tools</span>
              <Link href="/tools/health" onClick={onClose} className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                All {CALCULATORS.filter(c=>c.category==='health').length} →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-8">
              {Object.entries(hGroups).map(([group, calcs]) => (
                <MegaGroup key={group} group={group} calcs={calcs} category="health" accentDot="#2dd4bf" onClose={onClose}/>
              ))}
            </div>
          </div>

          {/* Finance */}
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Finance Tools</span>
              <Link href="/tools/finance" onClick={onClose} className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                All {CALCULATORS.filter(c=>c.category==='finance').length} →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-x-6">
              {Object.entries(fGroups).map(([group, calcs]) => (
                <MegaGroup key={group} group={group} calcs={calcs} category="finance" accentDot="#fbbf24" onClose={onClose}/>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-1 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">{CALCULATORS.length} calculators · instant · no signup · 100% private</p>
          <Link href="/tools" onClick={onClose} className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline">View all tools →</Link>
        </div>
      </div>
    </div>
  );
});

const NAV = [
  { href:'/tools',   label:'Tools',   hasMega:true  },
  { href:'/guides',  label:'Guides',  hasMega:false },
  { href:'/score',   label:'Score',   hasMega:false },
  { href:'/roadmap', label:'Roadmap', hasMega:false },
  { href:'/goals',   label:'Goals',   hasMega:false },
  ...(PLANS_ENABLED ? [{ href:'/plan', label:'Plans', hasMega:false }] : []),
  { href:'/about',   label:'About',   hasMega:false },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const clerkAppearance = useClerkAppearance();
  const [mounted,   setMounted]   = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showSrch,  setShowSrch]  = useState(false);
  const [mobile,    setMobile]    = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setShowTools(false); setShowSrch(false); setMobile(false); }, [pathname]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey||e.ctrlKey) && e.key==='k') { e.preventDefault(); setShowSrch(s=>!s); setShowTools(false); setMobile(false); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) { setShowTools(false); setShowSrch(false); }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const isActive = (href: string) => href==='/' ? pathname==='/' : !!pathname?.startsWith(href);
  const closeSearch = useCallback(() => setShowSrch(false), []);
  const closeMega   = useCallback(() => setShowTools(false), []);

  // The dashboard has its own sidebar app-shell (see DashboardShell) instead
  // of the site's top nav — suppressed here rather than in layout.tsx so the
  // logic stays with the component that already reads the pathname.
  if (pathname?.startsWith('/dashboard')) return null;

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-5">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1" aria-label="Main navigation">
            {NAV.map(item => item.hasMega ? (
              <Link key={item.href} href={item.href}
                onMouseEnter={() => { setShowTools(true); setShowSrch(false); }}
                onClick={() => { setShowTools(false); setShowSrch(false); }}
                aria-haspopup="true" aria-expanded={showTools}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showTools || isActive(item.href)
                    ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60'
                    : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                {item.label}
                <svg className={`w-3.5 h-3.5 opacity-50 transition-transform ${showTools ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </Link>
            ) : (
              <Link key={item.href} href={item.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60'
                    : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Search pill — desktop */}
            <button onClick={() => { setShowSrch(s=>!s); setShowTools(false); }}
              aria-label="Search"
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm w-44 transition-all ${
                showSrch
                  ? 'border-teal-500 dark:border-teal-400 bg-white dark:bg-gray-800'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-white dark:hover:bg-gray-750'
              }`}>
              <svg className={`w-3.5 h-3.5 flex-shrink-0 ${showSrch ? 'text-teal-500' : 'text-gray-400 dark:text-gray-500'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
              </svg>
              <span className="flex-1 text-left text-xs text-gray-400 dark:text-gray-500">Search…</span>
              <kbd className="text-[10px] text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 font-sans">⌘K</kbd>
            </button>

            {/* Mobile search */}
            <button onClick={() => { setShowSrch(s=>!s); setMobile(false); }} aria-label="Search"
              className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
              </svg>
            </button>

            {/* Theme toggle */}
            {mounted && (
              <button onClick={() => setTheme(theme==='dark'?'light':'dark')}
                aria-label={`Switch to ${theme==='dark'?'light':'dark'} mode`}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {theme==='dark'
                  ? <svg style={{width:18,height:18}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5"/><path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                  : <svg style={{width:18,height:18}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                }
              </button>
            )}

            {/* Auth */}
            <SignedOut>
              <Link href="/sign-in" aria-label="Sign in"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-950/70 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard"
                className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" appearance={clerkAppearance} />
            </SignedIn>

            {/* Mobile hamburger */}
            <button onClick={() => { setMobile(m=>!m); setShowSrch(false); setShowTools(false); }}
              aria-label={mobile ? 'Close menu' : 'Open menu'} aria-expanded={mobile}
              className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {mobile
                ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
              }
            </button>
          </div>
        </div>
      </div>

      {showSrch  && <SearchOverlay onClose={closeSearch} />}
      {showTools && !showSrch && <ToolsMegaMenu onClose={closeMega} />}

      {/* Mobile menu */}
      {mobile && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
          <nav aria-label="Mobile navigation" className="p-3 space-y-0.5">
            {NAV.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobile(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300'
                    : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                {item.label}
                <svg className="w-4 h-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-100 dark:border-gray-700 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-1 mb-2">Popular Tools</p>
            <div className="grid grid-cols-3 gap-1.5">
              {CALCULATORS.filter(c=>c.popular).slice(0,9).map(c => (
                <Link key={c.slug} href={`/tools/${c.category}/${c.slug}`} onClick={() => setMobile(false)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-center transition-colors ${
                    c.category==='health'
                      ? 'bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-950/70'
                      : 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/70'
                  }`}>
                  <span className="text-lg leading-none">{c.icon}</span>
                  <span className={`text-[10px] font-semibold leading-tight ${c.category==='health' ? 'text-teal-800 dark:text-teal-300' : 'text-amber-800 dark:text-amber-300'}`}>
                    {c.short}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="p-3 border-t border-gray-100 dark:border-gray-700">
            <Link href="/score" onClick={() => setMobile(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors">
              ⭐ Get Your WellFiLab Score
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
