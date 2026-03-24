"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StatusBanner } from "@/components/ui/status-banner";
import { TopNav } from "@/components/navigation/top-nav";
import { api, AdminUser, clearAuthSession, consumeFlashMessage, getStoredRole } from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [resetting, setResetting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setSuccessMessage(consumeFlashMessage());
    const role = getStoredRole();
    if (role !== "ADMIN") {
      router.replace("/admin/login");
      return;
    }
    setAuthorized(true);

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get<AdminUser[]>("/api/admin/users");
        setUsers(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            clearAuthSession();
            router.replace("/admin/login");
            return;
          }
          setError(err.response?.data?.message ?? "Unable to load users.");
        } else {
          setError("Unable to load users.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [router]);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      setError("");
      await api.delete(`/api/admin/users/${id}`);
      setUsers((current) => current.filter((user) => user.id !== id));
      setSuccessMessage("User deleted successfully.");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          clearAuthSession();
          router.replace("/admin/login");
          return;
        }
        setError(err.response?.data?.message ?? "Unable to delete user.");
      } else {
        setError("Unable to delete user.");
      }
    } finally {
      setDeletingId("");
    }
  };

  const handleResetAllData = async () => {
    const confirmed = window.confirm(
      "This will delete all user records, clear local browser data, and recreate only the default admin account. Continue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setResetting(true);
      setError("");
      await api.delete("/api/admin/reset");
      if (typeof window !== "undefined") {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }
      router.replace("/admin/login?reset=success");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Unable to reset application data.");
      } else {
        setError("Unable to reset application data.");
      }
    } finally {
      setResetting(false);
    }
  };

  if (!authorized) {
    return null;
  }

  return (
    <main className="min-h-screen text-white">
      <TopNav />
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-10">
        <GlassCard className="p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-violet-200/80">Admin Panel</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
                Placement Oracle administration
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-200/80">
                Your admin session is active. This panel can be extended with user management,
                analytics, and moderation tools.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                clearAuthSession();
                router.push("/admin/login");
              }}
              className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Logout
            </button>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <InfoTile label="Role" value="ADMIN" />
            <InfoTile label="Access" value="Secured with JWT" />
            <InfoTile label="Users" value={`${users.length}`} />
          </div>

          {successMessage ? <StatusBanner variant="success" message={successMessage} className="mt-8" /> : null}
          {error ? <StatusBanner variant="error" message={error} className="mt-8" /> : null}

          <div className="mt-10 overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-200">
                <thead className="bg-white/5 text-xs uppercase tracking-[0.24em] text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">GitHub</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-300">
                        <span className="inline-flex items-center gap-3">
                          <LoadingSpinner className="h-5 w-5" />
                          Loading users...
                        </span>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-300">
                        No users found yet.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-t border-white/10">
                        <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">{user.score}</td>
                        <td className="px-6 py-4">
                          {user.github ? (
                            <a
                              href={user.github}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-200 underline decoration-cyan-200/40"
                            >
                              Open GitHub
                            </a>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleDelete(user.id)}
                            disabled={deletingId === user.id}
                            className="rounded-full border border-rose-300/20 bg-rose-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === user.id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:scale-[1.01]"
            >
              Open User Dashboard
            </Link>
            <button
              type="button"
              onClick={handleResetAllData}
              disabled={resetting}
              className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-500/10 px-6 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resetting ? <LoadingSpinner /> : null}
              {resetting ? "Resetting..." : "Reset All Data"}
            </button>
          </div>
        </GlassCard>
      </section>
    </main>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
