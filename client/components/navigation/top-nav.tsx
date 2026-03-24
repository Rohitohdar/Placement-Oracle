"use client";

import { LogIn, LayoutDashboard, LogOut, Mic, Moon, ShieldCheck, Sparkles, Sun, UserRoundPlus, UserSquare2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuthSession, getStoredRole, isAuthenticated } from "@/lib/api";

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const isLightSurface = pathname === "/";

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setRole(getStoredRole());
    if (typeof window !== "undefined") {
      const storedTheme = window.localStorage.getItem("theme");
      setTheme(storedTheme === "light" ? "light" : "dark");
    }
  }, [pathname]);

  const toggleTheme = () => {
    if (typeof window === "undefined") {
      return;
    }

    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
  };

  const links = authenticated
    ? [
        { href: "/", label: "Home", icon: Sparkles },
        { href: "/profile", label: "Profile", icon: UserSquare2 },
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/interview", label: "Interview", icon: Mic },
        ...(role === "ADMIN" ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : [])
      ]
    : [
        { href: "/", label: "Home", icon: Sparkles },
        { href: "/login", label: "Login", icon: LogIn },
        { href: "/signup", label: "Signup", icon: UserRoundPlus }
      ];

  return (
    <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
      <Link
        href="/"
        className={`text-lg font-semibold tracking-[0.18em] ${
          isLightSurface ? "text-slate-900" : "text-white"
        }`}
      >
        Placement Oracle
      </Link>
      <div
        className={`flex flex-wrap items-center gap-2 rounded-full p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.18)] backdrop-blur-xl ${
          isLightSurface
            ? "border border-slate-200/80 bg-white/80"
            : "border border-white/10 bg-white/5"
        }`}
      >
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                active
                  ? "bg-white text-slate-950 shadow-[0_10px_24px_rgba(255,255,255,0.18)]"
                  : isLightSurface
                    ? "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
        {authenticated ? (
          <button
            type="button"
            onClick={() => {
              clearAuthSession();
              setAuthenticated(false);
              setRole("");
              router.push("/");
            }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
              isLightSurface
                ? "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                : "text-slate-200 hover:bg-white/10 hover:text-white"
            }`}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        ) : null}
        <button
          type="button"
          onClick={toggleTheme}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
            isLightSurface
              ? "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              : "text-slate-200 hover:bg-white/10 hover:text-white"
          }`}
        >
          {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {theme === "dark" ? "Dark Mode" : "Light Mode"}
        </button>
      </div>
    </nav>
  );
}
