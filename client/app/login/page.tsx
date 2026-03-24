"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StatusBanner } from "@/components/ui/status-banner";
import { AuthResponse, isValidEmail, setFlashMessage, storeAuthSession } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);
      console.info("[auth] login request", { email });
      const response = await axios.post<AuthResponse>("http://localhost:8080/api/auth/login", {
        email,
        password
      });
      console.info("[auth] login response", response.data);
      storeAuthSession(response.data);
      setFlashMessage(
        response.data.message || (response.data.role === "ADMIN" ? "Admin login successful." : "Login successful.")
      );
      router.push(response.data.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      console.error("[auth] login error", err);
      if (axios.isAxiosError(err)) {
        const apiMessage = err.response?.data?.message;
        setError(
          apiMessage === "Invalid email or password."
            ? "Invalid credentials"
            : apiMessage ?? "Server error. Check backend connection."
        );
      } else {
        setError("Server error. Check backend connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="User Access"
      title="Log in to your account"
      subtitle="Access your placement dashboard, saved profile, and interview tools."
      footerText="Need an account?"
      footerLinkLabel="Create one"
      footerLinkHref="/signup"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AnimatedField delay={0.05} label="Email">
          <InputWithIcon
            icon={Mail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </AnimatedField>
        <AnimatedField delay={0.1} label="Password">
          <InputWithIcon
            icon={LockKeyhole}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            trailingButton={
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </AnimatedField>

        {error ? <StatusBanner variant="error" message={error} /> : null}

        <motion.button
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.99 }}
          type="submit"
          disabled={loading}
          className="premium-button inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950"
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </motion.button>
      </form>
    </AuthShell>
  );
}

function AnimatedField({
  label,
  children,
  delay
}: {
  label: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.label
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="block space-y-3"
    >
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      {children}
    </motion.label>
  );
}

function InputWithIcon({
  icon: Icon,
  trailingButton,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: typeof Mail;
  trailingButton?: React.ReactNode;
}) {
  return (
    <div className="group flex h-14 items-center rounded-2xl border border-slate-200/80 bg-white/80 px-4 shadow-[0_12px_28px_rgba(148,163,184,0.08)] transition focus-within:-translate-y-0.5 focus-within:border-violet-300/60 focus-within:bg-white focus-within:shadow-[0_18px_36px_rgba(129,140,248,0.14)] dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:focus-within:bg-white/10 dark:focus-within:shadow-[0_14px_34px_rgba(76,29,149,0.18)]">
      <Icon className="h-5 w-5 text-slate-400 transition group-focus-within:text-violet-500 dark:group-focus-within:text-violet-300" />
      <input
        {...props}
        className="h-full w-full bg-transparent px-3 text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
      />
      {trailingButton}
    </div>
  );
}
