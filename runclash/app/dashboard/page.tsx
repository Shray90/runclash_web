"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  clearAuthSession,
  getSavedUser,
} from "../lib/cookies/authCookies";
import type { AuthUser } from "../lib/api/authApi";

type NavItem = {
  href: string;
  label: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);





  const navItems: NavItem[] = useMemo(
    () => [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/runtracker", label: "Runtracker" },
      { href: "/terotories", label: "Terotories" },
      { href: "/global-ranks", label: "Global ranks" },
      { href: "/setting", label: "Setting" },
    ],
    []
  );

  const handleLogout = () => {
    clearAuthSession();
    router.push("/login");
  };

  const initials = useMemo(() => {
    const fullName = user?.fullName?.trim();
    if (!fullName) return "?";
    const parts = fullName.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    const res = `${first}${second}`.toUpperCase();
    return res || "?";
  }, [user?.fullName]);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[280px_1fr]">
        {/* SIDEBAR */}
        <aside className="flex flex-col gap-6 border-r border-gray-200 bg-white px-5 py-7">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-lg font-extrabold text-sky-700 ring-1 ring-sky-100">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-bold text-gray-900">
                {user?.fullName || "Guest"}
              </div>
              <div className="text-sm font-medium text-gray-600">
                0 km ran
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "flex items-center justify-between rounded-lg bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 ring-1 ring-sky-100"
                      : "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Log out
            </button>
          </div>
        </aside>

        {/* CONTENT */}
        <section className="px-4 py-16 lg:px-10">
          <div className="mb-10 border-b border-gray-200 pb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-950">
              Welcome{user ? `, ${user.fullName}` : " to Runclash"}
            </h1>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-md border border-gray-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Profile
              </p>
              <p className="mt-3 text-sm text-gray-700">
                {user?.email || "Session cookie not found"}
              </p>
            </div>
            <div className="rounded-md border border-gray-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Role
              </p>
              <p className="mt-3 text-sm capitalize text-gray-700">
                {user?.role || "Guest"}
              </p>
            </div>
            <div className="rounded-md border border-gray-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Sprint
              </p>
              <p className="mt-3 text-sm text-gray-700">Auth flow complete</p>
            </div>
          </div>

          {!user && (
            <p className="mt-8 text-sm text-gray-600">
              Please{" "}
              <Link className="font-semibold text-sky-600 underline" href="/login">
                log in
              </Link>{" "}
              to load your saved session.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

