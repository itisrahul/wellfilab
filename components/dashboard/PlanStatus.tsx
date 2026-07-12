import { useState } from 'react';
import Link from 'next/link';
import type { StoredSubscription } from '@/lib/subscriptionStorage';

const PLAN_OPTIONS = [
  { id: 'diet',    icon: '🥗', name: 'Diet & Nutrition',      price: '₹149/mo' },
  { id: 'finance', icon: '💰', name: 'Personal Finance',      price: '₹149/mo' },
  { id: 'bundle',  icon: '⭐', name: 'Health + Finance Bundle', price: '₹249/mo' },
];

interface Props {
  subscription: StoredSubscription | null;
  onboarded: boolean;
  email: string;
  onCancel: () => Promise<void>;
}

export function PlanStatus({ subscription, onboarded, email, onCancel }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // ── No subscription — upgrade prompt ──
  if (!subscription) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">📋 Ready for a personalised plan?</p>
        <p className="text-xs text-gray-400 mb-4">Free tools show you the numbers. A plan shows you what to do with them.</p>
        <div className="space-y-2 mb-4">
          {PLAN_OPTIONS.map(p => (
            <Link key={p.id} href="/plan"
              className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-colors group">
              <span className="text-lg flex-shrink-0">{p.icon}</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors flex-1">{p.name}</span>
              <span className="text-xs font-bold text-gray-400">{p.price}</span>
            </Link>
          ))}
        </div>
        <p className="text-[11px] text-center text-gray-400">30-day refund guarantee</p>
      </div>
    );
  }

  const nextBilling = new Date(subscription.nextBillingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const isCancelled = subscription.status === 'cancelled';

  const runCancel = async () => {
    setCancelling(true);
    try { await onCancel(); } finally { setCancelling(false); setConfirming(false); }
  };

  // ── Cancelled — resubscribe ──
  if (isCancelled) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-900 dark:text-white">{subscription.planName}</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">cancelled</span>
        </div>
        <p className="text-xs text-gray-400 mb-4 flex-1">
          This plan is cancelled — you won&apos;t be billed again. You can resubscribe any time.
        </p>
        <Link href="/plan" className="block text-center text-xs font-bold px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors">
          Resubscribe →
        </Link>
      </div>
    );
  }

  // ── Subscribed but onboarding not done — urgent reminder ──
  if (!onboarded) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-amber-400 dark:border-amber-600 p-5 h-full flex flex-col">
        <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-1.5">⚠️ Complete your onboarding</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-1.5">
          You subscribed but haven&apos;t filled your onboarding form yet.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 flex-1">
          We cannot create your personalised plan until we know about you.
        </p>
        <Link href={`/plan/onboarding?plan=${subscription.planId}&email=${encodeURIComponent(email)}`}
          className="block text-center text-xs font-bold px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-colors mb-1">
          Complete onboarding now →
        </Link>
        <p className="text-[11px] text-center text-gray-400">Takes 5 minutes</p>
      </div>
    );
  }

  // ── Subscribed and onboarded — full status card ──
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{subscription.planName}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
          subscription.status === 'active' ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
        }`}>{subscription.status}</span>
      </div>

      <div className="space-y-1.5 mb-4">
        <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">✅ Onboarding complete</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">⏳ Plan arrives within 48 hours</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-center">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl py-2.5">
          <p className="text-lg font-black text-gray-900 dark:text-white">{subscription.weekNumber}</p>
          <p className="text-[10px] text-gray-400">Week</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl py-2.5">
          <p className="text-sm font-black text-gray-900 dark:text-white">{nextBilling}</p>
          <p className="text-[10px] text-gray-400">Next update</p>
        </div>
      </div>

      {subscription.deliveries.length > 0 && (
        <div className="space-y-1.5 mb-4">
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

      <p className="text-[11px] text-gray-400 mb-3">
        Questions? Email <a href="mailto:hello@wellfilab.com" className="text-teal-600 dark:text-teal-400 underline">hello@wellfilab.com</a>
      </p>

      <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
        {confirming ? (
          <div className="flex gap-2">
            <button onClick={runCancel} disabled={cancelling}
              className="flex-1 text-xs font-bold px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50">
              {cancelling ? 'Cancelling…' : 'Confirm cancel'}
            </button>
            <button onClick={() => setConfirming(false)} disabled={cancelling}
              className="flex-1 text-xs font-bold px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Keep plan
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)}
            className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors">
            Cancel subscription
          </button>
        )}
      </div>
    </div>
  );
}
