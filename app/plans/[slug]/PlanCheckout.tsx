'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Plan } from '@/lib/plans';

interface Props { plan: Plan; }

export function PlanCheckout({ plan }: Props) {
  const searchParams = useSearchParams();
  const initialBilling = (searchParams.get('billing') ?? 'monthly') as 'monthly' | 'yearly';

  const [billing,  setBilling]  = useState<'monthly' | 'yearly'>(initialBilling);
  const [email,    setEmail]    = useState('');
  const [name,     setName]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

  const handleCheckout = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          billing,
          email: email.trim(),
          name: name.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); setLoading(false); return; }
      window.location.href = data.url;
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-7 sticky top-24">
      <h2 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-1">Start your free trial</h2>
      <p className="text-sm text-gray-500 mb-5">7 days free · then ${price}/month · cancel anytime</p>

      {/* No forced login note */}
      <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2.5 mb-5">
        <span className="text-green-500">✓</span>
        <p className="text-xs font-semibold text-green-700 dark:text-green-400">
          No account needed — we create it automatically on sign-up
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="First name"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-teal-500 transition-all"/>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Email <span className="text-red-400">*</span>
          </label>
          <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="you@example.com"
            className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-teal-500 transition-all ${error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}/>
          {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
        </div>

        {/* Billing toggle */}
        <div className="grid grid-cols-2 gap-3">
          {(['monthly', 'yearly'] as const).map(b => (
            <button key={b} onClick={() => setBilling(b)}
              className={`text-center py-3 rounded-xl border-2 text-xs font-semibold transition-all capitalize ${
                billing === b
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
              }`}>
              {b}
              <span className="block font-bold text-sm mt-0.5">
                ${b === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}/mo
              </span>
              {b === 'yearly' && (
                <span className="block text-[10px] text-teal-500 mt-0.5">
                  Save ${(plan.monthlyPrice - plan.yearlyPrice) * 12}/yr
                </span>
              )}
            </button>
          ))}
        </div>

        <button onClick={handleCheckout} disabled={loading}
          className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed`}>
          {loading
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Redirecting…</>
            : <><span>🔒</span>Continue to checkout</>
          }
        </button>

        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <span>🔒 Stripe secure</span>
          <span>💳 Card / UPI</span>
          <span>🛡️ 30-day refund</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        By subscribing you agree to our{' '}
        <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
