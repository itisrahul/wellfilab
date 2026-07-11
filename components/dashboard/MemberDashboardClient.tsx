'use client';
import { useState } from 'react';
import Link from 'next/link';

/* ── Types ── */
interface PlanMember {
  name: string;
  email: string;
  plan: 'diet' | 'finance' | 'bundle';
  startDate: string;
  nextDelivery: string;
  weekNumber: number;
}

const PLAN_META = {
  diet:    { label:'Diet & Nutrition Plan',    icon:'🥗', color:'teal',   accent:'bg-teal-600',   light:'bg-teal-50 dark:bg-teal-950/20',   text:'text-teal-700 dark:text-teal-400'   },
  finance: { label:'Personal Finance Plan',    icon:'💰', color:'amber',  accent:'bg-amber-500',  light:'bg-amber-50 dark:bg-amber-950/20',  text:'text-amber-700 dark:text-amber-400'  },
  bundle:  { label:'Health + Finance Bundle',  icon:'⭐', color:'purple', accent:'bg-purple-600', light:'bg-purple-50 dark:bg-purple-950/20', text:'text-purple-700 dark:text-purple-400' },
};

/* ── Demo data (replace with real API call) — name/email overridden by real Clerk user ── */
const DEMO_MEMBER: PlanMember = {
  name: 'Alex Johnson',
  email: 'alex@example.com',
  plan: 'bundle',
  startDate: '2025-06-01',
  nextDelivery: '2025-07-14',
  weekNumber: 6,
};

const DIET_TASKS = [
  { done:true,  label:'Week 6 meal plan delivered', date:'Mon 8 Jul' },
  { done:true,  label:'Grocery list sent',           date:'Mon 8 Jul' },
  { done:false, label:'Week 7 meal plan',            date:'Mon 15 Jul' },
  { done:false, label:'Monthly check-in',            date:'Wed 17 Jul' },
];

const FINANCE_TASKS = [
  { done:true,  label:'Budget spreadsheet sent',       date:'Tue 2 Jun' },
  { done:true,  label:'Investment roadmap delivered',  date:'Fri 7 Jun' },
  { done:false, label:'Monthly strategy email',        date:'Mon 15 Jul' },
  { done:false, label:'Quarterly review session',      date:'Tue 2 Sep' },
];

const TOOLS_REC = [
  { slug:'sip',         cat:'finance', icon:'📈', label:'SIP Calculator',      reason:'Track your monthly investments' },
  { slug:'bmi',         cat:'health',  icon:'⚖️', label:'BMI Calculator',       reason:'Monitor your weight progress'  },
  { slug:'retirement',  cat:'finance', icon:'🎯', label:'Retirement Calculator', reason:'Plan your financial future'    },
  { slug:'calories',    cat:'health',  icon:'🔥', label:'Calorie Calculator',    reason:'Match your meal plan targets'  },
];

interface Props {
  userName: string;
  userEmail: string;
}

export function MemberDashboardClient({ userName, userEmail }: Props) {
  const [member] = useState<PlanMember>({ ...DEMO_MEMBER, name: userName, email: userEmail });
  const meta = PLAN_META[member.plan];

  const daysActive = Math.floor((Date.now() - new Date(member.startDate).getTime()) / 86400000);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Header ── */}
      <div className={`${meta.accent} text-white`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">Member Dashboard</p>
              <h1 className="text-2xl font-extrabold mb-1">Welcome back, {member.name.split(' ')[0]} 👋</h1>
              <p className="text-white/75 text-sm">{meta.icon} {meta.label} · Week {member.weekNumber}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="text-center bg-white/15 rounded-xl px-5 py-3">
                <p className="text-2xl font-black">{daysActive}</p>
                <p className="text-white/60 text-[11px]">Days active</p>
              </div>
              <div className="text-center bg-white/15 rounded-xl px-5 py-3">
                <p className="text-2xl font-black">{member.weekNumber}</p>
                <p className="text-white/60 text-[11px]">Week</p>
              </div>
              <div className="text-center bg-white/15 rounded-xl px-5 py-3">
                <p className="text-lg font-black">Jul 15</p>
                <p className="text-white/60 text-[11px]">Next delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Next delivery banner ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-2xl flex-shrink-0">📬</div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-white text-sm">Next delivery in 6 days</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Week 7 meal plan + updated grocery list — arriving Monday, 15 July
            </p>
          </div>
          <span className="flex-shrink-0 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-3 py-1.5 rounded-full">
            On track ✓
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* ── Diet plan progress ── */}
            {(member.plan === 'diet' || member.plan === 'bundle') && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🥗</span>
                    <h2 className="font-bold text-gray-900 dark:text-white text-sm">Diet & Nutrition</h2>
                  </div>
                  <Link href="/tools/health/calories" className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline">
                    Open calorie tool →
                  </Link>
                </div>

                {/* This week's meals */}
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">This week</p>
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mb-5">
                    {['M','T','W','T','F','S','S'].map((day, i) => (
                      <div key={i} className={`rounded-xl p-2.5 text-center text-xs font-semibold ${
                        i < 3 ? 'bg-teal-500 text-white' :
                        i === 3 ? 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-2 border-teal-500' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      }`}>
                        <p className="text-[10px] opacity-70 mb-0.5">{day}</p>
                        {i < 3 ? '✓' : i === 3 ? '•' : '–'}
                      </div>
                    ))}
                  </div>

                  {/* Macro summary */}
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Today's targets</p>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      {label:'Calories', val:'1,850 kcal', pct:72, color:'bg-teal-500'  },
                      {label:'Protein',  val:'120g',       pct:85, color:'bg-blue-500'  },
                      {label:'Carbs',    val:'200g',       pct:60, color:'bg-amber-500' },
                    ].map(m => (
                      <div key={m.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">{m.label}</p>
                        <p className="font-bold text-sm text-gray-900 dark:text-white mb-2">{m.val}</p>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full ${m.color} rounded-full`} style={{width:`${m.pct}%`}}/>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery timeline */}
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Delivery status</p>
                  <div className="space-y-2">
                    {DIET_TASKS.map((t, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${t.done ? 'bg-teal-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          {t.done
                            ? <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                            : <div className="w-1.5 h-1.5 rounded-full bg-gray-400"/>
                          }
                        </div>
                        <p className={`text-sm flex-1 ${t.done ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{t.label}</p>
                        <span className="text-xs text-gray-400 flex-shrink-0">{t.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Finance plan progress ── */}
            {(member.plan === 'finance' || member.plan === 'bundle') && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💰</span>
                    <h2 className="font-bold text-gray-900 dark:text-white text-sm">Personal Finance</h2>
                  </div>
                  <Link href="/tools/finance/sip" className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                    Open SIP tool →
                  </Link>
                </div>
                <div className="p-5">
                  {/* Finance milestones */}
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Your financial goals</p>
                  <div className="space-y-3 mb-5">
                    {[
                      { label:'Emergency fund (3 months)',    pct:65, val:'₹4,875 / ₹7,500'  },
                      { label:'Monthly SIP investments',      pct:100, val:'₹500/mo ✓'       },
                      { label:'High-interest debt cleared',   pct:40, val:'₹2,400 / ₹6,000'  },
                      { label:'Retirement corpus on track',   pct:82, val:'On track'          },
                    ].map(g => (
                      <div key={g.label}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-gray-600 dark:text-gray-400">{g.label}</p>
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{g.val}</p>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full transition-all" style={{width:`${g.pct}%`}}/>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Delivery status</p>
                  <div className="space-y-2">
                    {FINANCE_TASKS.map((t, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${t.done ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          {t.done
                            ? <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                            : <div className="w-1.5 h-1.5 rounded-full bg-gray-400"/>
                          }
                        </div>
                        <p className={`text-sm flex-1 ${t.done ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{t.label}</p>
                        <span className="text-xs text-gray-400 flex-shrink-0">{t.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">

            {/* Score link */}
            <Link href="/score"
              className="block p-5 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-500 text-white hover:shadow-lg transition-all group">
              <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Your Score</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black">74</span>
                <span className="text-white/60 text-sm">/100</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-white rounded-full" style={{width:'74%'}}/>
              </div>
              <p className="text-xs text-white/70">Up 6 points since last month →</p>
            </Link>

            {/* Recommended tools */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Tools for your plan</p>
              <div className="space-y-2">
                {TOOLS_REC.map(t => (
                  <Link key={t.slug} href={`/tools/${t.cat}/${t.slug}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                    <span className="text-lg flex-shrink-0">{t.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{t.label}</p>
                      <p className="text-[10px] text-gray-400 truncate">{t.reason}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Need help?</p>
              <div className="space-y-2">
                <Link href="/contact"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <span className="text-lg">✉️</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Email support</p>
                    <p className="text-[10px] text-gray-400">Reply within 24 hours</p>
                  </div>
                </Link>
                <Link href="/plan"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <span className="text-lg">⬆️</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Upgrade plan</p>
                    <p className="text-[10px] text-gray-400">Add health + finance bundle</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Manage subscription */}
            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Subscription</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {meta.label}<br/>
                ₹249/month · renews Aug 1
              </p>
              <button className="w-full py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:border-red-300 hover:text-red-500 transition-all">
                Manage subscription
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
