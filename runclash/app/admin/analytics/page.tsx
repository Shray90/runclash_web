"use client";

import { useEffect, useState } from "react";
import { getAdminAnalytics } from "@/lib/api/stats";
import Link from "next/link";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
} from "recharts";
import { ChartColumn, Megaphone, Hand, Flag, Star, Trophy, Target } from "lucide-react";

const COLORS = ["#dc2626", "#f97316", "#fbbf24", "#a855f7", "#3b82f6", "#10b981"];

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getAdminAnalytics();
        if (res.success) setAnalytics(res.data);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 mb-6">Admin Analytics</h1>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="skeleton-shimmer h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!analytics) {
    return (
      <main className="min-h-screen bg-white px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 mb-6">Admin Analytics</h1>
          <div className="py-12 text-center text-gray-400">No analytics data available</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">📊 Admin Analytics</h1>
            <p className="mt-2 text-gray-600">Platform-wide metrics and insights.</p>
          </div>
          <Link href="/admin/users" className="text-sm font-semibold text-gray-600 underline-offset-4 hover:underline">Manage Users</Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up">
          {[
            { label: "Total Users", value: analytics.totalUsers, sub: `+${analytics.newUsersThisMonth} this month` },
            { label: "Total Runs", value: analytics.totalRuns, sub: `+${analytics.runsThisMonth} this month` },
            { label: "Total Distance", value: `${(analytics.totalDistance / 1000).toFixed(1)} km`, sub: `${(analytics.dailyDistance / 1000).toFixed(1)} km today` },
            { label: "Active Users", value: analytics.activeUsers, sub: "online now" },
            { label: "Territories", value: `${analytics.capturedTerritories}/${analytics.totalTerritories}`, sub: "captured" },
            { label: "Total XP", value: `${(analytics.totalXP / 1000).toFixed(1)}k`, sub: "platform wide" },
            { label: "Total Coins", value: `${(analytics.totalCoins / 1000).toFixed(1)}k`, sub: "platform wide" },
            { label: "Active Challenges", value: analytics.activeChallenges, sub: "currently active" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{item.label}</p>
              <p className="mt-2 text-3xl font-black text-gray-900">{item.value}</p>
              <p className="mt-1 text-xs text-gray-400">{item.sub}</p>
            </div>
          ))}
        </div>

        {analytics.dailyRegistrations && analytics.dailyRegistrations.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Daily Registrations (Last 30 Days)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.dailyRegistrations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} stroke="#999" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#999" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {analytics.weeklyActivity && analytics.weeklyActivity.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Weekly Activity</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.weeklyActivity}>
                  <defs>
                    <linearGradient id="colorWeeklyRuns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} stroke="#999" />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#999" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#999" unit=" km" />
                  <Tooltip />
                  <Area yAxisId="left" type="monotone" dataKey="runs" stroke="#dc2626" fill="url(#colorWeeklyRuns)" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="distance" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316", r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {analytics.monthlyActivity && analytics.monthlyActivity.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Activity</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} stroke="#999" />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#999" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#999" unit=" km" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="runs" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="distance" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316", r: 4 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {analytics.mostActiveRunners && analytics.mostActiveRunners.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-fade-in-up">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Most Active Runners</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-3 text-left text-xs font-bold uppercase text-gray-500">Runner</th>
                      <th className="p-3 text-left text-xs font-bold uppercase text-gray-500">Level</th>
                      <th className="p-3 text-left text-xs font-bold uppercase text-gray-500">Distance</th>
                      <th className="p-3 text-left text-xs font-bold uppercase text-gray-500">Runs</th>
                      <th className="p-3 text-left text-xs font-bold uppercase text-gray-500">XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.mostActiveRunners.map((r: any, idx: number) => (
                      <tr key={r._id || idx} className="border-b border-gray-50">
                        <td className="p-3 text-sm font-semibold text-gray-900">{r.firstName} {r.lastName}</td>
                        <td className="p-3 text-sm text-gray-700">{r.level}</td>
                        <td className="p-3 text-sm text-gray-700">{(r.totalDistance / 1000).toFixed(1)} km</td>
                        <td className="p-3 text-sm text-gray-700">{r.totalRuns}</td>
                        <td className="p-3 text-sm text-gray-700">{r.xp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {analytics.xpDistribution && analytics.xpDistribution.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-fade-in-up">
              <h2 className="text-lg font-bold text-gray-900 mb-4">XP Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.xpDistribution} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label>
                      {analytics.xpDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {analytics.xpDistribution.map((entry: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm text-gray-700">{entry._id}: {entry.count} users</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {analytics.territoryOwnership && analytics.territoryOwnership.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Territory Ownership Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.territoryOwnership} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#999" allowDecimals={false} />
                  <YAxis dataKey="ownerName" type="category" tick={{ fontSize: 12 }} stroke="#999" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#dc2626" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {analytics.leaderboardOverview && analytics.leaderboardOverview.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Leaderboard Overview</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-3 text-left text-xs font-bold uppercase text-gray-500">Rank</th>
                    <th className="p-3 text-left text-xs font-bold uppercase text-gray-500">Runner</th>
                    <th className="p-3 text-left text-xs font-bold uppercase text-gray-500">Level</th>
                    <th className="p-3 text-left text-xs font-bold uppercase text-gray-500">XP</th>
                    <th className="p-3 text-left text-xs font-bold uppercase text-gray-500">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.leaderboardOverview.map((r: any, idx: number) => (
                    <tr key={r._id || idx} className="border-b border-gray-50">
                      <td className="p-3 text-sm font-bold text-gray-900">#{idx + 1}</td>
                      <td className="p-3 text-sm font-semibold text-gray-900">{r.firstName} {r.lastName} (@{r.username})</td>
                      <td className="p-3 text-sm text-gray-700">{r.level}</td>
                      <td className="p-3 text-sm text-gray-700">{r.xp}</td>
                      <td className="p-3 text-sm text-gray-700">{(r.totalDistance / 1000).toFixed(1)} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {analytics.recentSystemActivity && analytics.recentSystemActivity.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent System Activity</h2>
            <div className="space-y-3">
              {analytics.recentSystemActivity.map((activity: any, idx: number) => (
                <div key={activity._id || idx} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {activity.type === "friend_request" ? <Hand className="h-5 w-5 text-blue-500" /> :
                       activity.type === "territory_captured" ? <Flag className="h-5 w-5 text-red-500" /> :
                       activity.type === "achievement_unlocked" ? <Trophy className="h-5 w-5 text-yellow-500" /> :
                       activity.type === "challenge_completed" ? <Target className="h-5 w-5 text-emerald-500" /> :
                       activity.type === "level_up" ? <Star className="h-5 w-5 text-orange-500" /> :
                       <Megaphone className="h-5 w-5 text-gray-500" />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.message}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {activity.userId?.firstName} {activity.userId?.lastName} • {new Date(activity.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}