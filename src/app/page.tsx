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
      {/* Glow */}
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
            <a href="#">Features</a>
            <a href="#">Dashboard</a>
            <a href="#">AI Coach</a>
            <Link
              href="https://healthwealthtools.com"
              target="_blank"
            >
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
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6 inline-flex rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-2 text-sm text-teal-300">
            Life Optimization Platform
          </div>

          <h1 className="text-6xl font-black leading-tight">
            The Operating System
            <br />
            for Better{" "}
            <span className="bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">
              Health & Wealth
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-slate-400">
            Track wellness, improve productivity, and build smarter
            financial habits with AI-powered insights.
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
              Explore Tools
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>

        {/* Dashboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
        >
          <div className="grid grid-cols-2 gap-4">
            <Card
              icon={<Activity />}
              title="Health Score"
              value="84"
            />

            <Card
              icon={<Wallet />}
              title="Wealth Score"
              value="76"
            />

            <Card
              icon={<Brain />}
              title="Focus"
              value="91%"
            />

            <Card
              icon={<Moon />}
              title="Recovery"
              value="89%"
            />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-slate-400">
                Performance Analytics
              </p>

              <BarChart3 className="text-teal-400" />
            </div>

            <div className="flex h-40 items-end gap-3">
              {[30, 50, 70, 60, 90, 80, 100].map((h, i) => (
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

      {/* Tool Ecosystem */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-bold">
            Explore Health & Wealth Tools
          </h2>

          <p className="mt-4 text-slate-400">
            Use free calculators and assessments from our tools ecosystem.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            "Sleep Calculator",
            "Savings Calculator",
            "Burnout Analyzer",
            "Hydration Calculator",
            "Investment Planner",
            "Focus Tracker",
          ].map((tool) => (
            <Link
              key={tool}
              href="https://healthwealthtools.com"
              target="_blank"
              className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-2"
            >
              <div className="mb-5 inline-flex rounded-2xl bg-teal-500/10 p-4 text-teal-400">
                <Activity />
              </div>

              <h3 className="text-2xl font-semibold">{tool}</h3>

              <p className="mt-3 text-slate-400">
                Open free tool →
              </p>
            </Link>
          ))}
        </div>
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