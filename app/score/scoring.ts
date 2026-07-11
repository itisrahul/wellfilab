import { QUESTIONS, DIMS } from './data';
import type { Answer, DimResult, ScoreResult, Profile, Action } from './types';
import { HWT_URL } from '@/config/site';

export function calcScore(answers: Answer[]): ScoreResult {
  const map = Object.fromEntries(answers.map(a => [a.qid, a.value]));

  const dims: DimResult[] = DIMS.map(d => {
    const qs = QUESTIONS.filter(q => q.dimension.id === d.id);
    let s = 0, max = 0;
    qs.forEach(q => {
      s   += ((map[q.id] ?? 0) / 100) * q.weight * 100;
      max += q.weight * 100;
    });
    const pct = max > 0 ? Math.round((s / max) * 100) : 0;
    const label = pct >= 80 ? 'Excellent' : pct >= 65 ? 'Good' : pct >= 45 ? 'Fair' : 'Needs work';
    return { dim: d, pct, label };
  });

  const avg = (type: string) => {
    const ds = dims.filter(d => d.dim.type === type);
    return Math.round(ds.reduce((s, d) => s + d.pct, 0) / ds.length);
  };

  const health = avg('health');
  const wealth = avg('wealth');
  return {
    health,
    wealth,
    overall: Math.round((health + wealth) / 2),
    balance: 100 - Math.round(Math.abs(health - wealth) * 0.8),
    dims,
  };
}

export function getProfile(health: number, wealth: number, overall: number): Profile {
  if (overall >= 80)                    return { name:'Thriving',          emoji:'🌟', gradient:'from-emerald-600 to-teal-600',  summary:'Exceptional foundation across health and wealth.',                   action:'Maintain and push both dimensions above 85.' };
  if (health >= 70 && wealth >= 70)     return { name:'Balanced',          emoji:'⚖️', gradient:'from-teal-600 to-cyan-600',     summary:'Strong in both health and wealth — a rare position.',                action:'Push weakest dimension to 80+ to reach Thriving.' };
  if (health >= 70 && wealth < 50)      return { name:'Healthy Broke',     emoji:'💪', gradient:'from-orange-500 to-amber-500',  summary:'Excellent health habits, but finances need urgent attention.',       action:'Apply the same discipline you use for health to your finances.' };
  if (wealth >= 70 && health < 50)      return { name:'Wealthy Unwell',    emoji:'💰', gradient:'from-blue-600 to-indigo-600',   summary:'Strong finances but not investing in your most valuable asset.',     action:'Money cannot buy back lost health. Treat it like a financial investment.' };
  if (overall < 35)                     return { name:'Foundation',        emoji:'🏗️', gradient:'from-red-500 to-orange-500',    summary:'Both areas need attention. Every journey starts with one step.',      action:'Pick one dimension and focus there for 90 days first.' };
  if (health > wealth + 20)             return { name:'Health Forward',    emoji:'🏃', gradient:'from-teal-500 to-green-500',    summary:'Good health instincts. Wealth is lagging significantly.',            action:'Start financial automation immediately. Even ₹1,000/month matters.' };
  if (wealth > health + 20)             return { name:'Finance First',     emoji:'📈', gradient:'from-amber-500 to-orange-500',  summary:'Decent financial habits but health is deteriorating.',               action:'Burnout and medical costs will destroy your wealth. Prioritise health.' };
  return                                       { name:'Growing',           emoji:'🌱', gradient:'from-cyan-600 to-teal-600',     summary:'Making progress but significant room to improve in both areas.',     action:'Focus on your two lowest-scoring dimensions first.' };
}

export function getActions(dims: DimResult[]): Action[] {
  const sorted = [...dims].sort((a, b) => a.pct - b.pct);
  const out: Omit<Action, 'weekRange'>[] = [];

  sorted.forEach(d => {
    if (d.pct >= 65) return;
    const urgent = d.pct < 40;
    if (d.dim.id === 'body')      out.push({ urgent, title:'Start a daily movement habit',              body:'30 minutes of walking 5 days a week has the highest health ROI of any single intervention. First step: pick a fixed time today (e.g. right after waking, or right after your last meeting) and walk for just 10 minutes — extend the duration once the time slot itself becomes automatic.',                                          link:{label:'Calories Burned Calculator',url:`/tools/health/calories-burned`} });
    if (d.dim.id === 'nutrition') out.push({ urgent, title:'Fix protein and water first',               body:'Before overhauling your entire diet, start with two changes: drink 2L of water daily and include a protein source at every meal. First step: keep a bottle on your desk and refill it twice — that alone gets most people to 1.5–2L without any other change.',                                                                          link:{label:'Calculate your macro targets',url:`/tools/health/macros`} });
    if (d.dim.id === 'mind')      out.push({ urgent, title:'Fix your sleep routine first',               body:'Fix your wake time (same every day, including weekends), cut screens 90 minutes before bed, set your bedroom to 18–19°C. First step: pick one fixed wake time and hold it for 7 days straight before changing anything else — this alone stabilises the rest.',                                                                          link:{label:'Sleep Calculator',url:`/tools/health/sleep`} });
    if (d.dim.id === 'savings')   out.push({ urgent, title:'Automate savings on salary day',             body:'Set an automatic transfer to a separate account the day salary arrives. First step: open your banking app today and schedule a standing instruction for even ₹1,000–2,000/month — the amount matters far less than removing the monthly decision entirely.',                                                                          link:{label:'SIP Calculator',url:`/tools/finance/sip`} });
    if (d.dim.id === 'debt')      out.push({ urgent, title:'List every debt, attack highest-rate first', body:'You cannot outrun high-interest debt with investments. First step: write down every debt with its exact interest rate today, in one place — most people have never done this and are surprised by what they find once it is all in front of them.',                                                                                      link:{label:'Debt Payoff Calculator',url:`/tools/finance/debt-payoff`} });
    if (d.dim.id === 'future')    out.push({ urgent, title:'Buy adequate health insurance this week',    body:'A single hospitalisation without insurance can wipe out years of savings. First step: get quotes for a ₹10 lakh family floater policy this week — even before deciding, comparing quotes takes under 30 minutes and removes the biggest excuse for delay.',                                                                                link:{label:'Retirement Calculator',url:`/tools/finance/retirement`} });
  });

  const top4 = out.slice(0, 4);
  const weekRanges = ['Weeks 1–2', 'Weeks 3–4', 'Weeks 5–8', 'Weeks 9–12'];
  return top4.map((a, i) => ({ ...a, weekRange: weekRanges[i] ?? `Week ${i * 2 + 1}+` }));
}
