"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StatusBanner } from "@/components/ui/status-banner";
import { AuthResponse, isValidEmail, setFlashMessage, storeAuthSession } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@placement.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "success") {
      setResetMessage("All application data was reset. Sign in with the default admin account to start fresh.");
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Enter a valid admin email address.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);
      console.info("[auth] admin login request", { email });
      const response = await axios.post<AuthResponse>("http://localhost:8080/api/auth/login", {
        email,
        password
      });
      console.info("[auth] admin login response", response.data);

      if (response.data.role !== "ADMIN") {
        setError("This login is only for admin accounts.");
        return;
      }

      storeAuthSession(response.data);
      setFlashMessage(response.data.message || "Admin session started successfully.");
      router.push("/admin");
    } catch (err) {
      console.error("[auth] admin login error", err);
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
      badge="Admin Access"
      title="Admin control panel login"
      subtitle="Authenticate with your admin credentials to access the Placement Oracle management view."
      footerText="Need user access instead?"
      footerLinkLabel="Go to user login"
      footerLinkHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="Admin Email">
          <AuthInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </AuthField>
        <AuthField label="Password">
          <AuthInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </AuthField>

        {resetMessage ? <StatusBanner variant="success" message={resetMessage} /> : null}
        {error ? <StatusBanner variant="error" message={error} /> : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Authenticating...
            </>
          ) : (
            "Login as Admin"
          )}
        </button>
      </form>
    </AuthShell>
  );
}

function AuthField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-3">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      {children}
    </label>
  );
}

function AuthInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-14 w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-300/50 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
    />
  );
}
