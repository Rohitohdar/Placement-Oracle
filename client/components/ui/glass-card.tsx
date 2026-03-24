"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function GlassCard({ children, className = "", delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/75 backdrop-blur-2xl shadow-[0_24px_80px_rgba(148,163,184,0.18)] before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(255,255,255,0.45),transparent_35%,rgba(96,165,250,0.08))] before:pointer-events-none dark:border-white/15 dark:bg-white/10 dark:shadow-[0_24px_80px_rgba(76,29,149,0.28)] dark:before:bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%,rgba(96,165,250,0.08))] ${className}`}
    >
      {children}
    </motion.div>
  );
}
