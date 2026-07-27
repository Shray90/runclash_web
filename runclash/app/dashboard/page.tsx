"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getDashboardStats, getChartsData } from "@/lib/api/stats";
import { getMiniLeaderboard } from "@/lib/api/leaderboard";
import { getRunHistory } from "@/lib/api/run";
import { getCurrentRun } from "@/lib/api/run";
import { getUserTerritories } from "@/lib/api/territories";
import { useNotifications, useLeaderboardUpdates, useTerritoryUpdates } from "@/lib/hooks/useSocket";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";
import AchievementCelebration from "@/app/_components/AchievementCelebration";
import ChallengeCelebration from "@/app/_components/ChallengeCelebration";
import EmptyState from "@/app/_components/EmptyState";
import { handleLogout } from "@/lib/actions/auth-action";

const navItems = [
  { href: "/dashboard", label: "Dashboard", emoji: "\u{1F4CA}" },
  { href: "/runtracker", label: "Run Tracker", emoji: "\u{1F3C3}" },
  { href: "/global-ranks", label: "Global Ranks", emoji: "\u{1F3C6}" },
  { href: "/territories", label: "Territories", emoji: "\u{1F5FA}\uFE0F" },
  { href: "/profile", label: "Profile", emoji: "\u{1F464}" },
  { href: "/friends", label: "Friends", emoji: "\u{1F465}" },
  { href: "/challenges", label: "Challenges", emoji: "\u{1F3AF}" },
  { href: "/notifications", label: "Notifications", emoji: "\u{1F514}" },
  { href: "/setting", label: "Settings", emoji: "⚙️" },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [recentRuns, setRecentRuns] = useState<any[]>([]);
  const [activeRun, setActiveRun] = useState<any>(null);
  const [ownedTerritories, setOwnedTerritories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { unreadCount } = useNotifications();
  const leaderboardUpdate = useLeaderboardUpdates();
  const territoryUpdate = useTerritoryUpdates();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartsRes, lbRes, runsRes, runRes, territoriesRes] = await Promise.allSettled([
          getDashboardStats(),
          getChartsData(),
          getMiniLeaderboard(5),
          getRunHistory({ page: 1, limit: 5 }),
          getCurrentRun(),
          getUserTerritories(),
        ]);
        if (statsRes.status === "fulfilled" && statsRes.value.success) setStats(statsRes.value.data);
        if (chartsRes.status === "fulfilled" && chartsRes.value.success) setCharts(chartsRes.value.data);
        if (lbRes.status === "fulfilled" && lbRes.value.success) setLeaderboard(lbRes.value.data);
        if (runsRes.status === "fulfilled" && runsRes.value.success) setRecentRuns(runsRes.value.data);
        if (runRes.status === "fulfilled" && runRes.value.success) setActiveRun(runRes.value.data);
        if (territoriesRes.status === "fulfilled" && territoriesRes.value.success) setOwnedTerritories(territoriesRes.value.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [leaderboardUpdate, territoryUpdate]);

  const formatDistance = (meters: number) => {
    if (!meters) return "0.00";
    return (meters / 1000).toFixed(2);
  };

  const formatPace = (pace: number) => {
    if (!pace) return "--:--";
    const min = Math.floor(pace);
    const sec = Math.round((pace - min) * 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const getLevelProgress = () => {
    if (!stats) return 0;
    const xpInLevel = stats.xp % 500;
    return Math.min(100, (xpInLevel / 500) * 100);
  };

  const formatXp = (xp: number) => {
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
    return xp.toString();
  };

  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={`skeleton-shimmer rounded-lg ${className}`} />
  );

  if (loading || isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[280px_1fr]">
          <aside className="flex flex-col gap-6 border-r border-gray-200 bg-white px-5 py-7">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-full mt-auto" />
          </aside>
          <section className="px-4 py-16 lg:px-10">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-96 mb-8" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <Skeleton className="h-80 rounded-3xl" />
              <Skeleton className="h-80 rounded-3xl" />
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-6 border-r border-gray-200 bg-white px-5 py-7">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-xl font-black text-white shadow-md">RC</div>
            <div>
              <p className="text-base font-bold text-gray-900">RunClash</p>
              {user && <p className="text-sm text-gray-500">Lvl {user.level || stats?.level || 1}</p>}
            </div>
          </Link>
          {stats && (
            <div className="rounded-xl bg-gradient-to-br from-red-50 to-orange-50 p-4 border border-red-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-700">Level {stats.level}</span>
                <span className="text-xs font-semibold text-gray-500">{formatXp(stats.xp)} XP</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-red-100 overflow-hidden">
                <div className="h-2.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500" style={{ width: `${getLevelProgress()}%` }} />
              </div>
              <p className="mt-1 text-xs text-gray-400">{stats.xpToNextLevel} XP to next level</p>
            </div>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all hover:bg-red-50 hover:text-red-700 ${item.href === "/dashboard" ? "bg-red-50 text-red-700" : "text-gray-700"}`}>
                <span>{item.emoji}</span>
                {item.label}
                {item.label === "Notifications" && unreadCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{unreadCount}</span>
                )}
              </Link>
            ))}
          </nav>
          <form action={handleLogout} className="mt-auto">
            <button type="submit" className="w-full rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 hover:shadow-md">Logout</button>
          </form>
        </aside>

        <section className="px-4 py-10 lg:px-10 space-y-8">
          <div className="animate-fade-in-up">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-600">Dashboard</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-950">Welcome back{user?.firstName ? `, ${user.firstName}` : ""} 🏃</h1>
            <p className="mt-2 text-gray-600">Your performance, stats and next missions are all here.</p>
          </div>

          {activeRun && (
            <div className="rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6 shadow-sm animate-fade-in-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="inline-flex h-3 w-3 rounded-full bg-green-500" />
                  </span>
                  <div>
                    <p className="font-semibold text-green-800">Current Run</p>
                    <p className="text-sm text-green-600">
                      {activeRun.status === "paused" ? "Paused" : "Running"} — {formatDistance(activeRun.distance || 0)} km | {(activeRun.duration || 0) > 0 ? `${Math.floor((activeRun.duration || 0) / 60)}:${String(Math.floor((activeRun.duration || 0) % 60)).padStart(2, "0")}` : "0:00"}
                    </p>
                  </div>
                </div>
                <Link href="/runtracker" className="rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700 hover:shadow-md">
                  View Run
                </Link>
              </div>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm card-hover">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Today</p>
              <p className="mt-2 text-3xl font-black text-gray-900">{formatDistance(stats?.todaysDistance || 0)} km</p>
              <p className="mt-1 text-xs text-gray-400">{stats?.todayCalories || 0} kcal</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm card-hover">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Current Rank</p>
              <p className="mt-2 text-3xl font-black text-gray-900">#{stats?.currentRank || 0}</p>
              <p className="mt-1 text-xs text-gray-400">of {stats?.totalUsers || 0} runners</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm card-hover">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Level {stats?.level || 1}</p>
              <p className="mt-2 text-3xl font-black text-gray-900">{formatXp(stats?.xp || 0)} XP</p>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500" style={{ width: `${getLevelProgress()}%` }} />
              </div>
              <p className="mt-1 text-xs text-gray-400">{stats?.xpToNextLevel || 0} to next</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm card-hover">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Streak</p>
              <p className="mt-2 text-3xl font-black text-gray-900">{stats?.currentStreak || 0} days</p>
              <p className="mt-1 text-xs text-gray-400">Best: {stats?.territoriesCaptured || 0} territories</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Weekly Distance</h2>
              <div className="h-72">
                {charts?.weeklyDistances ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.weeklyDistances}>
                      <defs>
                        <linearGradient id="colorWeeklyDist" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#999" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#999" unit=" km" />
                      <Tooltip />
                      <Area type="monotone" dataKey="distance" stroke="#dc2626" fill="url(#colorWeeklyDist)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400 text-sm">No data yet</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Distance</h2>
              <div className="h-72">
                {charts?.monthlyDistances ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.monthlyDistances}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#999" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#999" unit=" km" />
                      <Tooltip />
                      <Bar dataKey="distance" fill="#dc2626" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400 text-sm">No data yet</div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Calories</h2>
              <div className="h-72">
                {charts?.weeklyCalories ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.weeklyCalories}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#999" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#999" unit=" kcal" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400 text-sm">No data yet</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pace</h2>
              <div className="h-72">
                {charts?.paceOverTime && charts.paceOverTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.paceOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#999" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#999" unit=" min/km" />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} dot={{ fill: "#dc2626", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400 text-sm">No pace data yet</div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Territory Captures</h2>
            <div className="h-64">
              {charts?.territoryCaptureHistory ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.territoryCaptureHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#999" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#999" allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400 text-sm">No captures yet</div>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Leaderboard</h2>
                <Link href="/global-ranks" className="text-sm font-semibold text-red-600 hover:text-red-700">View All</Link>
              </div>
              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((entry: any, idx: number) => (
                    <div key={entry._id || idx} className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-red-50">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">#{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{entry.username || entry.firstName || "Runner"}</p>
                        <p className="text-xs text-gray-500">Lvl {entry.level || 1}</p>
                      </div>
                      <span className="text-sm font-bold text-red-700">{formatXp(entry.totalPoints || entry.xp || 0)} XP</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon="🏆" title="No rankings yet" description="Be the first to appear on the leaderboard." actionLabel="Go for a run" actionHref="/runtracker" />
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recent Runs</h2>
                <Link href="/runtracker" className="text-sm font-semibold text-red-600 hover:text-red-700">View All</Link>
              </div>
              {recentRuns.length > 0 ? (
                <div className="space-y-3">
                  {recentRuns.map((run: any) => (
                    <div key={run._id} className="flex items-center justify-between rounded-lg p-3 transition hover:bg-gray-50">
                      <div>
                        <p className="font-semibold text-gray-900">{formatDistance(run.distance || 0)} km</p>
                        <p className="text-xs text-gray-500">{new Date(run.startTime || run.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-700">{formatPace(run.pace || 0)} /km</p>
                        <p className="text-xs text-gray-400">{Math.floor((run.duration || 0) / 60)} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon="🏃" title="No runs yet" description="Start your first run and capture your first territory!" actionLabel="Start Running" actionHref="/runtracker" />
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recent Captures</h2>
                <Link href="/territories" className="text-sm font-semibold text-red-600 hover:text-red-700">View All</Link>
              </div>
              {stats?.recentCaptures && stats.recentCaptures.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentCaptures.map((capture: any) => (
                    <div key={capture._id} className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-gray-50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-lg">
                        {capture.icon || "🏁"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{capture.name || "Territory"}</p>
                        <p className="text-xs text-gray-500">+{capture.xpReward || 0} XP</p>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(capture.capturedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon="🏁" title="No captures yet" description="Run through territories to start capturing." actionLabel="Find Territories" actionHref="/territories" />
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Owned Territories</h2>
                <Link href="/territories" className="text-sm font-semibold text-red-600 hover:text-red-700">View All</Link>
              </div>
              {ownedTerritories.length > 0 ? (
                <div className="space-y-3">
                  {ownedTerritories.slice(0, 5).map((territory: any) => (
                    <div key={territory._id} className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-gray-50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-lg">
                        {territory.icon || "🏁"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{territory.name}</p>
                        <p className="text-xs text-gray-500">{territory.captureProgress || 0}% captured</p>
                      </div>
                      <div className="h-2 w-16 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-2 rounded-full bg-red-500 transition-all duration-500" style={{ width: `${territory.captureProgress || 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon="🏁" title="No territories owned yet" description="Start capturing to build your empire." actionLabel="Go to Territories" actionHref="/territories" />
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                <Link href="/notifications" className="text-sm font-semibold text-red-600 hover:text-red-700">View All</Link>
              </div>
              {stats?.recentNotifications && stats.recentNotifications.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentNotifications.map((notification: any) => (
                    <div key={notification._id} className={`flex items-start gap-3 rounded-lg p-3 transition hover:bg-gray-50 ${!notification.read ? "bg-red-50" : ""}`}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm">
                        {notification.type === "territory_captured" ? "🏁" : notification.type === "achievement" ? "🏆" : notification.type === "friend_request" ? "👋" : "📢"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{notification.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{notification.message}</p>
                      </div>
                      {!notification.read && <span className="mt-1 h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon="🔔" title="No notifications yet" description="Activity alerts will appear here." actionLabel="Explore" actionHref="/territories" />
              )}
            </div>
          </div>
        </section>
      </div>
      <AchievementCelebration />
      <ChallengeCelebration />
    </main>
  );
}
