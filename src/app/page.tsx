"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  Wallet,
  Brain,
  ArrowRight,
  Moon,
  BarChart3,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-teal-500/20 blur-[120px]" />
        <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-purple-500/20 blur-[120px]" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">
            WellFi<span className="text-teal-400">Lab</span>
          </h1>

          <nav className="hidden gap-8 md:flex text-slate-300">
            <a href="#features">Features</a>
            <a href="#dashboard">Dashboard</a>
            <Link href="https://healthwealthtools.com" target="_blank">
              Tools
            </Link>
          </nav>

          <button className="rounded-full bg-teal-500 px-5 py-2 text-black font-semibold">
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-24 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6 inline-flex rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-2 text-sm text-teal-300">
            AI-powered life tracking
          </div>

          <h1 className="text-6xl font-black leading-tight">
            Improve your
            <br />
            <span className="bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">
              Health & Wealth
            </span>
            <br />
            with clarity
          </h1>

          <p className="mt-6 max-w-xl text-lg text-slate-400">
            Track your habits, finances, focus, and recovery in one intelligent dashboard.
            Get insights that help you make better daily decisions.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button className="rounded-full bg-teal-500 px-7 py-4 font-semibold text-black">
              Start Free
            </button>

            <Link
              href="https://healthwealthtools.com"
              target="_blank"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-4"
            >
              Explore Free Tools
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
        >
          <div className="grid grid-cols-2 gap-4">
            <Card icon={<Activity />} title="Health" value="84" />
            <Card icon={<Wallet />} title="Wealth" value="76" />
            <Card icon={<Brain />} title="Focus" value="91%" />
            <Card icon={<Moon />} title="Recovery" value="89%" />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="mb-4 flex justify-between">
              <p className="text-slate-400">Weekly Trend</p>
              <BarChart3 className="text-teal-400" />
            </div>

            <div className="flex h-40 items-end gap-3">
              {[35, 55, 45, 70, 85, 75, 95].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-full rounded-t-xl bg-gradient-to-t from-teal-500 to-purple-500"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

function Card({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="mb-4 text-teal-400">{icon}</div>
      <p className="text-slate-400">{title}</p>
      <h3 className="text-3xl font-bold">{value}</h3>
    </div>
  );
}