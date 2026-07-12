'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Plan } from '@/lib/plans';
import { saveSubscription, type StoredSubscription } from '@/lib/subscriptionStorage';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Props { plan: Plan; }

export function PlanCheckout({ plan }: Props) {
  const searchParams   = useSearchParams();
  const initialBilling = (searchParams.get('billing') ?? 'monthly') as 'monthly' | 'yearly';

  const [billing,  setBilling]  = useState<'monthly' | 'yearly'>(initialBilling);
  const [email,    setEmail]    = useState('');
  const [name,     setName]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [rzpReady, setRzpReady] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    if (window.Razorpay) { setRzpReady(true); return; }
    const script    = document.createElement('script');
    script.src      = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload   = () => setRzpReady(true);
    script.onerror  = () => console.error('Failed to load Razorpay');
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const monthlyDisplay = `₹${plan.monthlyPrice}/mo`;
  const yearlyDisplay  = `₹${plan.yearlyPrice}/yr`;
  const yearlySaving   = ((plan.monthlyPrice * 12) - plan.yearlyPrice);

  // Every checkout starts a 7-day free trial (matches the button copy and
  // the success page) — "next billing" is when the trial converts.
  const recordSubscription = (subscriptionId?: string) => {
    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + 7);
    const sub: StoredSubscription = {
      planId: plan.id as StoredSubscription['planId'],
      planName: plan.name,
      status: 'trial',
      subscriptionId,
      nextBillingDate: nextBillingDate.toISOString(),
      weekNumber: 1,
      deliveries: [],
    };
    return saveSubscription(sub);
  };

  const handleCheckout = async () => {
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email'); return; }
    setLoading(true);
    setError('');

    try {
      const res  = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId:plan.id, billing, email:email.trim(), name:name.trim(), phone:phone.trim() }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); setLoading(false); return; }

      // Demo mode — record locally (no real Razorpay keys configured) and redirect
      if (data.mode === 'demo') {
        await recordSubscription();
        window.location.href = data.url;
        return;
      }

      // Production — open Razorpay checkout
      if (data.mode === 'razorpay') {
        if (!window.Razorpay) { setError('Payment gateway not loaded. Please refresh.'); setLoading(false); return; }

        const rzp = new window.Razorpay({
          key:             data.keyId,
          subscription_id: data.subscriptionId,
          name:            'WellFiLab',
          description:     `${data.planName} — ${billing}`,
          prefill:         data.prefill,
          theme:           { color: '#0d9488' },
          modal: {
            ondismiss: () => setLoading(false),
          },
          handler: (response: any) => {
            // Payment successful — verify on server, record locally, then redirect
            fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_payment_id:      response.razorpay_payment_id,
                razorpay_signature:       response.razorpay_signature,
                planId:   data.planId,
                billing:  data.billing,
                email:    email.trim(),
              }),
            }).finally(() => {
              // Even if verify fails, redirect — webhook handles truth server-side
              recordSubscription(data.subscriptionId).finally(() => {
                window.location.href = data.successUrl;
              });
            });
          },
        });
        rzp.open();
        setLoading(false);
      }

    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-7 shadow-sm">
      <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6">Subscribe to {plan.name}</h2>

      {/* Billing toggle */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Billing</p>
        <div className="grid grid-cols-2 gap-2">
          {(['monthly', 'yearly'] as const).map(b => (
            <button key={b} onClick={() => setBilling(b)}
              className={`flex flex-col items-center p-3.5 rounded-xl border-2 transition-all ${
                billing === b
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}>
              <span className={`text-sm font-bold ${billing===b ? 'text-teal-700 dark:text-teal-300' : 'text-gray-700 dark:text-gray-300'}`}>
                {b === 'monthly' ? monthlyDisplay : yearlyDisplay}
              </span>
              <span className={`text-xs mt-0.5 capitalize ${billing===b ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'}`}>
                {b === 'yearly' ? `Save ₹${yearlySaving}` : 'Monthly'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-colors"/>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-colors"/>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Phone (optional — for UPI)</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-colors"/>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Price summary */}
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{plan.name}</p>
          <p className="text-xs text-gray-500 capitalize">{billing} · 7-day free trial</p>
        </div>
        <p className="text-lg font-extrabold text-teal-600 dark:text-teal-400">
          {billing === 'monthly' ? monthlyDisplay : yearlyDisplay}
        </p>
      </div>

      {/* Pay button */}
      <button onClick={handleCheckout} disabled={loading || !rzpReady}
        className={`w-full py-4 rounded-xl font-bold text-white text-sm transition-all ${
          loading || !rzpReady
            ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
            : `bg-gradient-to-r ${plan.gradient} hover:shadow-lg hover:scale-[1.01]`
        }`}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Processing…
          </span>
        ) : (
          `Start 7-Day Free Trial · ${billing === 'monthly' ? monthlyDisplay : yearlyDisplay}`
        )}
      </button>

      {/* Trust signals */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {['🔒 Secure payment', '7-day free trial', '30-day refund'].map(t => (
          <span key={t} className="text-xs text-gray-400">{t}</span>
        ))}
      </div>

      {/* Payment methods */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400 text-center mb-2">Accepted payments</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'EMI', 'Wallets'].map(m => (
            <span key={m} className="text-[10px] font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
