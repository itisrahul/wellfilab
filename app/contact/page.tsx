'use client';
import { useState } from 'react';
import Link from 'next/link';

const SUBJECTS = [
  { value:'general',    label:'General question' },
  { value:'error',      label:'Found an error in a calculator or guide' },
  { value:'suggestion', label:'Tool or guide suggestion' },
  { value:'plan',       label:'Question about paid plans' },
  { value:'privacy',    label:'Privacy or data request' },
];

export default function ContactPage() {
  const [form, setForm]   = useState({ name:'', email:'', subject:'general', message:'' });
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');

  const canSubmit = form.name.trim() && form.email.trim() && form.message.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setStatus('idle'); alert(data.error ?? 'Something went wrong.'); return; }
      setStatus('sent');
    } catch {
      setStatus('idle');
      alert('Network error. Please try again.');
    }
  };

  if (status === 'sent') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/40 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">✅</div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Message sent</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            We usually reply within 24 hours to <strong>{form.email}</strong>.
          </p>
          <Link href="/" className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline">← Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">

      {/* ── Header ── */}
      <div className="border-b border-gray-100 dark:border-gray-800 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-4">Contact</p>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Get in touch</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Found an error? Have a suggestion? Questions about plans? We read every message and reply within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-12">

          {/* Left — info */}
          <div className="md:col-span-2 space-y-6">

            <div className="space-y-3">
              {[
                { icon:'✉️', label:'Email',          value:'hello@wellfilab.com',   href:'mailto:hello@wellfilab.com' },
                { icon:'🔒', label:'Privacy queries', value:'privacy@wellfilab.com', href:'mailto:privacy@wellfilab.com' },
              ].map(c => (
                <a key={c.label} href={c.href}
                  className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-800 transition-colors group">
                  <span className="text-xl flex-shrink-0">{c.icon}</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{c.label}</p>
                    <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 group-hover:underline">{c.value}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1.5">📍 Reporting an error?</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                Tell us which tool, what inputs you used, and what result seems wrong.
                We fix accuracy issues within 48 hours.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Response time</p>
              <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span>General queries</span><span className="font-semibold text-gray-700 dark:text-gray-300">24 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Error reports</span><span className="font-semibold text-gray-700 dark:text-gray-300">48 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Plan questions</span><span className="font-semibold text-gray-700 dark:text-gray-300">24 hours</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right — form */}
          <div className="md:col-span-3">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 space-y-5">

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Subject</label>
                <select value={form.subject} onChange={e => setForm(f=>({...f,subject:e.target.value}))}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-teal-500 transition-all appearance-none cursor-pointer">
                  {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Message *</label>
                <textarea rows={5} value={form.message} onChange={e => setForm(f=>({...f,message:e.target.value}))}
                  placeholder="Describe what you need help with…"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-all resize-none" />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || status === 'sending'}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>

              <p className="text-[11px] text-gray-400 text-center">
                We reply within 24 hours · Your data is never shared with third parties
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
