"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileUp, LineChart, Sparkles } from "lucide-react";
import Link from "next/link";
import { TopNav } from "@/components/navigation/top-nav";

const steps = [
  {
    title: "Upload Profile",
    description: "Add your academics, skills, resume, and target company details in one clean form.",
    icon: FileUp
  },
  {
    title: "Get Analysis",
    description: "See your score, company fit, safe options, resume insights, and gap analysis instantly.",
    icon: LineChart
  },
  {
    title: "Improve Skills",
    description: "Follow a focused roadmap to improve weak areas and become placement-ready faster.",
    icon: Sparkles
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.92),_rgba(238,242,255,0.96)_35%,_rgba(224,231,255,0.92)_70%,_rgba(219,234,254,0.9)_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_15%_18%,_rgba(168,85,247,0.35),_transparent_26%),radial-gradient(circle_at_86%_12%,_rgba(59,130,246,0.34),_transparent_26%),radial-gradient(circle_at_50%_78%,_rgba(99,102,241,0.22),_transparent_24%),linear-gradient(135deg,_#12081f_0%,_#23124a_45%,_#0a1630_100%)] dark:text-white">
      <TopNav />

      <section className="mx-auto flex min-h-[calc(100vh-88px)] max-w-5xl items-center px-6 py-16 lg:px-10">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="inline-flex items-center rounded-full border border-violet-200 bg-white/70 px-4 py-2 text-sm font-medium text-violet-700 shadow-[0_10px_30px_rgba(148,163,184,0.12)] backdrop-blur dark:border-violet-200/20 dark:bg-violet-300/10 dark:text-violet-100 dark:shadow-[0_10px_30px_rgba(76,29,149,0.22)]">
              Placement Oracle
            </div>
            <h1 className="mt-8 text-5xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
              Know Your Placement Readiness
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
              A simple way to understand where you stand, what companies fit your profile, and what to improve next.
            </p>

            <div className="mt-10">
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-8 py-4 text-base font-medium text-white shadow-[0_18px_40px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-900 dark:bg-white dark:text-slate-950 dark:shadow-[0_18px_40px_rgba(255,255,255,0.12)] dark:hover:bg-slate-100"
              >
                Start Analysis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-16 grid max-w-6xl gap-6 md:grid-cols-3"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="rounded-[32px] border border-white/70 bg-white/70 p-8 text-center shadow-[0_24px_80px_rgba(148,163,184,0.16)] backdrop-blur dark:border-white/10 dark:bg-white/10 dark:shadow-[0_24px_80px_rgba(76,29,149,0.28)]"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 text-violet-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-400">
                    Step {index + 1}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{step.title}</h2>
                  <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{step.description}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
