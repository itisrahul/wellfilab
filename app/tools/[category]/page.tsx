import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CALCULATORS, getByCategory, getGroups, type Category } from '@/config/tools';
import { SITE_NAME } from '@/config/site';

const VALID: Category[] = ['health','finance'];
export const generateStaticParams = () => VALID.map(c => ({ category: c }));

const META = {
  health:  { title:'Health Calculators', headline:'🌿 Health Calculators', sub:'Body, nutrition and fitness tools. Instant results. No signup.', gradient:'from-teal-700 via-teal-600 to-cyan-500', ac:'teal'  as const, facts:['⚖️ A healthy BMI is 18.5–24.9. Body fat % tells a more complete story.','🔥 500 kcal/day deficit = ~0.5 kg fat loss per week.','💧 Aim for ~35 ml of water per kg of body weight.','😴 Waking at cycle end feels far more refreshing.'] },
  finance: { title:'Finance Calculators', headline:'💰 Finance Calculators', sub:'Investment, loan, tax and budgeting tools. Instant results. No signup.', gradient:'from-amber-600 via-amber-500 to-orange-400', ac:'amber' as const, facts:['📈 Starting at 25 vs 35 can double your retirement savings.','🏠 On a $300K/30yr mortgage at 7%, interest exceeds the loan.','💡 Rule of 72: 72 ÷ return rate = years to double money.','🔥 FIRE number = annual expenses × 25.'] },
};

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const cat = params.category as Category;
  if (!VALID.includes(cat)) return {};
  const m = META[cat];
  return { title: `${m.title} | ${SITE_NAME}`, description: m.sub };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const cat = params.category as Category;
  if (!VALID.includes(cat)) notFound();
  const m = META[cat], isH = cat === 'health', ac = m.ac;
  const groups = getGroups(cat), all = getByCategory(cat), popular = all.filter(c => c.popular);
  const hBorder = isH ? 'border-l-teal-400' : 'border-l-amber-400';
  const hHover  = isH ? 'hover:border-teal-200 hover:bg-teal-50 dark:hover:bg-teal-950/20' : 'hover:border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/20';
  const hTitle  = isH ? 'group-hover:text-teal-700 dark:group-hover:text-teal-400' : 'group-hover:text-amber-700 dark:group-hover:text-amber-400';

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <section className={`bg-gradient-to-br ${m.gradient} text-white`}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <nav className="text-xs text-white/60 flex items-center gap-1.5 mb-6">
            <Link href="/" className="hover:text-white">Home</Link><span>/</span><span className="text-white/90 font-medium capitalize">{cat}</span>
          </nav>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="font-extrabold text-4xl md:text-5xl mb-3 leading-tight">{m.headline}</h1>
              <p className="text-white/80 text-lg mb-4">{m.sub}</p>
              <span className="bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold">{all.length} free tools</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {popular.map(c=>(
                <Link key={c.slug} href={`/tools/${cat}/${c.slug}`} className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-3 transition-all group">
                  <span className="text-2xl flex-shrink-0">{c.icon}</span>
                  <div className="min-w-0"><p className="font-semibold text-sm text-white truncate group-hover:text-amber-200">{c.short}</p><p className="text-xs text-white/50 truncate mt-0.5 hidden sm:block">{c.desc.split('.')[0]}</p></div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-10">
            {Object.entries(groups).map(([group,calcs])=>(
              <section key={group}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={isH ? "w-1.5 h-6 rounded-full bg-teal-500" : "w-1.5 h-6 rounded-full bg-amber-500"}/>
                  <h2 className={isH ? "font-extrabold text-lg text-teal-700 dark:text-teal-400" : "font-extrabold text-lg text-amber-700 dark:text-amber-400"}>{group}</h2>
                  <span className="text-xs text-gray-400">{calcs.length} tools</span>
                </div>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {calcs.map(c=>(
                    <Link key={c.slug} href={`/tools/${cat}/${c.slug}`} className={`group flex items-start gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 border-l-2 ${hBorder} ${hHover} hover:shadow-md transition-all`}>
                      <span className="text-2xl flex-shrink-0 mt-0.5">{c.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h3 className={`font-semibold text-sm text-gray-800 dark:text-gray-200 ${hTitle} transition-colors leading-tight`}>{c.title}</h3>
                          {c.popular&&<span className={isH ? "flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400" : "flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"}>Popular</span>}
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{c.desc}</p>
                        <div className="flex flex-wrap gap-1 mt-2">{c.tags.slice(0,2).map(tag=><span key={tag} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{tag}</span>)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="space-y-5">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wide mb-3">All {cat} tools</h3>
              <ul className="space-y-0.5">{all.map(c=>(
                <li key={c.slug}><Link href={`/tools/${cat}/${c.slug}`} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${c.popular?(isH?"font-semibold text-teal-600 dark:text-teal-400":"font-semibold text-amber-600 dark:text-amber-400"):'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}><span>{c.icon}</span><span>{c.short}</span>{c.popular&&<span className="ml-auto text-[10px] opacity-60">★</span>}</Link></li>
              ))}</ul>
            </div>
            <div className={`rounded-2xl p-4 border-2 ${isH?'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800':'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800'}`}>
              <h3 className={`font-bold text-sm mb-1 ${isH?'text-amber-700 dark:text-amber-400':'text-teal-700 dark:text-teal-400'}`}>{isH?'💰 Also try Finance':'🌿 Also try Health'}</h3>
              <p className="text-xs text-gray-500 mb-3">{isH?'Compound interest, loan EMI, retirement planning.':'BMI, calories, sleep cycles, weight loss.'}</p>
              <Link href={isH?'/finance':'/health'} className={`text-xs font-bold ${isH?'text-amber-600 dark:text-amber-400':'text-teal-600 dark:text-teal-400'}`}>Explore {isH?'Finance':'Health'} →</Link>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wide mb-3">💡 Did You Know?</h3>
              <div className="space-y-2">{m.facts.map((f,i)=><div key={i} className="flex gap-2 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl"><span className="text-sm flex-shrink-0">{f.slice(0,2)}</span><p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.slice(2)}</p></div>)}</div>
            </div>
            <div className="ad-box h-60"><p className="text-xs text-gray-400">Advertisement · 300×250</p></div>
          </aside>
        </div>
      </div>
    </div>
  );
}
