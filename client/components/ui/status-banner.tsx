"use client";

type StatusBannerProps = {
  variant: "error" | "success" | "info";
  message: string;
  className?: string;
};

const styles = {
  error: "border-rose-300/20 bg-rose-500/10 text-rose-100",
  success: "border-emerald-300/20 bg-emerald-500/10 text-emerald-100",
  info: "border-cyan-300/20 bg-cyan-500/10 text-cyan-100"
};

export function StatusBanner({ variant, message, className = "" }: StatusBannerProps) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[variant]} ${className}`}>
      {message}
    </div>
  );
}
