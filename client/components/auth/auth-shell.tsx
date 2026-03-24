"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  badge: string;
  children: ReactNode;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
};

export function AuthShell({
  title,
  subtitle,
  badge,
  children,
  footerText,
  footerLinkLabel,
  footerLinkHref
}: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12 text-slate-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(238,242,255,0.92)_36%,_rgba(219,234,254,0.86)_100%)] dark:bg-[radial-gradient(circle_at_20%_20%,_rgba(168,85,247,0.24),_transparent_24%),radial-gradient(circle_at_80%_0%,_rgba(59,130,246,0.2),_transparent_22%),linear-gradient(135deg,_#12081f_0%,_#23124a_45%,_#0a1630_100%)]" />
      <div className="pointer-events-none absolute left-[8%] top-[12%] h-40 w-40 rounded-full bg-violet-200/60 blur-3xl dark:bg-violet-500/20" />
      <div className="pointer-events-none absolute bottom-[10%] right-[8%] h-48 w-48 rounded-full bg-sky-200/70 blur-3xl dark:bg-sky-500/20" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative w-full max-w-xl rounded-[36px] border border-slate-200/70 bg-white/82 p-8 shadow-[0_24px_80px_rgba(148,163,184,0.18)] backdrop-blur-xl dark:border-white/15 dark:bg-white/10 dark:shadow-[0_24px_80px_rgba(76,29,149,0.28)] md:p-10"
      >
        <div className="mb-8 space-y-4">
          <div className="inline-flex rounded-full border border-violet-200/60 bg-violet-100/80 px-4 py-2 text-sm text-violet-700 dark:border-violet-200/20 dark:bg-violet-300/10 dark:text-violet-100">
            {badge}
          </div>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h1>
            <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-200/80">{subtitle}</p>
          </div>
        </div>

        {children}

        <p className="mt-8 text-sm text-slate-600 dark:text-slate-300">
          {footerText}{" "}
          <Link href={footerLinkHref} className="font-medium text-slate-950 underline decoration-slate-400 dark:text-white dark:decoration-white/40">
            {footerLinkLabel}
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
