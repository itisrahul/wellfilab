import Link from 'next/link';
import type { StoredSubscription } from '@/lib/dashboardData';

const PLAN_OPTIONS = [
  { id: 'diet',    icon: '🥗', name: 'Diet & Nutrition',      price: '₹149/mo' },
  { id: 'finance', icon: '💰', name: 'Personal Finance',      price: '₹149/mo' },
  { id: 'bundle',  icon: '⭐', name: 'Health + Finance Bundle', price: '₹249/mo' },
];

export function PlanStatus({ subscription }: { subscription: StoredSubscription | null }) {
  if (!subscription) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">No active plan</p>
        <p className="text-xs text-gray-400 mb-4">Subscribe to unlock personalised meal plans and budget check-ins.</p>
        <div className="space-y-2 mb-4">
          {PLAN_OPTIONS.map(p => (
            <Link key={p.id} href="/plan"
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
              <span className="text-lg flex-shrink-0">{p.icon}</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors flex-1">{p.name}</span>
              <span className="text-xs font-bold text-gray-400">{p.price}</span>
            </Link>
          ))}
        </div>
        <Link href="/plan" className="block text-center text-xs font-bold px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors">
          View Plans & Pricing →
        </Link>
      </div>
    );
  }

  const nextBilling = new Date(subscription.nextBillingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{subscription.planName}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
          subscription.status === 'active' ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
          : subscription.status === 'trial' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
        }`}>{subscription.status}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4 text-center">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl py-2.5">
          <p className="text-lg font-black text-gray-900 dark:text-white">{subscription.weekNumber}</p>
          <p className="text-[10px] text-gray-400">Week</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl py-2.5">
          <p className="text-sm font-black text-gray-900 dark:text-white">{nextBilling}</p>
          <p className="text-[10px] text-gray-400">Next billing</p>
        </div>
      </div>
      {subscription.deliveries.length > 0 && (
        <div className="space-y-1.5">
          {subscription.deliveries.slice(0, 4).map((d, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${d.done ? 'bg-teal-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                {d.done && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
              </div>
              <p className={`text-xs flex-1 ${d.done ? 'line-through text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>{d.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
