import Link from "next/link";
import { handleLogout } from '@/lib/actions/auth-action';

// TODO: make nav items configurable from CMS or user permissions
const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/runtracker", label: "Runtracker" },
  { href: "/terotories", label: "Terotories" },
  { href: "/global-ranks", label: "Global ranks" },
  { href: "/setting", label: "Setting" },
];

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-6 border-r border-gray-200 bg-white px-5 py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-black text-red-700">
              R
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">RunClash</p>
              <p className="text-sm text-gray-500">Member dashboard</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-red-50 hover:text-red-700 hover:pl-5"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form action={handleLogout} className="mt-auto">
            <button
              type="submit"
              className="w-full rounded-full border border-red-700 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 hover:shadow-md"
            >
              Logout
            </button>
          </form>
        </aside>

        <section className="px-4 py-16 lg:px-10">
          <div className="mb-10 border-b border-gray-200 pb-5 animate-fade-in-up">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-600">Dashboard</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-950">Welcome back to RunClash</h1>
            <p className="mt-2 text-gray-600">Your performance, stats and next missions are all here.</p>
          </div>

          {/* OPTIMIZE: stats should be fetched server-side for SEO and caching */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="card-hover rounded-3xl border border-gray-200 bg-red-50 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-700">Total Users</p>
              <p className="mt-4 text-3xl font-black text-gray-950">1,234</p>
            </div>
            <div className="card-hover rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Active Clashes</p>
              <p className="mt-4 text-3xl font-black text-gray-950">567</p>
            </div>
            <div className="card-hover rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Total Distance</p>
              <p className="mt-4 text-3xl font-black text-gray-950">12,345 km</p>
            </div>
          </div>

          {/* REVIEW: chart libraries not yet installed (recharts/chart.js) — placeholders until decided */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="card-hover rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-950">Monthly Active Users</h2>
                <span className="animate-pulse-soft rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Live</span>
              </div>
              <div className="mt-6 h-64 rounded-3xl bg-gradient-to-b from-red-50 to-gray-100 p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-gray-400 text-sm font-medium">Chart: Monthly Active Users</p>
                  {/* TODO: replace with <Chart /> component once library is selected */}
                </div>
              </div>
            </div>

            <div className="card-hover rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-950">Clash Outcomes</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Status</span>
              </div>
              <div className="mt-6 h-64 rounded-3xl bg-gradient-to-b from-blue-50 to-gray-100 p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p className="text-gray-400 text-sm font-medium">Chart: Clash Outcomes</p>
                  {/* TODO: replace with <Chart /> component once library is selected */}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
