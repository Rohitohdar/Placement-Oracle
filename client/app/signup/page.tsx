"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StatusBanner } from "@/components/ui/status-banner";
import { AuthResponse, isValidEmail, setFlashMessage } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      console.info("[auth] signup request", { name, email });
      const response = await axios.post<AuthResponse>("http://localhost:8080/api/auth/signup", {
        name,
        email,
        password
      });
      console.info("[auth] signup response", response.data);

      setFlashMessage(response.data.message || "Signup successful. Please log in with your new account.");
      router.push("/login");
    } catch (err) {
      console.error("[auth] signup error", err);
      if (axios.isAxiosError(err)) {
        const apiMessage = err.response?.data?.message;
        setError(
          apiMessage === "User already exists with this email."
            ? "User already exists"
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
      badge="Create Account"
      title="Join Placement Oracle"
      subtitle="Create your student account to unlock placement scoring, GitHub insights, and dashboard analysis."
      footerText="Already have an account?"
      footerLinkLabel="Log in"
      footerLinkHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AnimatedField delay={0.04} label="Name">
          <InputWithIcon
            icon={UserRound}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </AnimatedField>
        <AnimatedField delay={0.08} label="Email">
          <InputWithIcon
            icon={Mail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </AnimatedField>
        <AnimatedField delay={0.12} label="Password">
          <InputWithIcon
            icon={LockKeyhole}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
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
        <AnimatedField delay={0.16} label="Confirm Password">
          <InputWithIcon
            icon={LockKeyhole}
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            trailingButton={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              Creating account...
            </>
          ) : (
            "Sign Up"
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
