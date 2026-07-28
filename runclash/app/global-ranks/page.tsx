"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLeaderboard } from "@/lib/api/leaderboard";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useLeaderboardUpdates } from "@/lib/hooks/useSocket";
import EmptyState from "@/app/_components/EmptyState";
import { Trophy, Flag, MapPin, Search, ChevronLeft, ChevronRight, User, Medal } from "lucide-react";

type SortBy = "distance" | "points" | "territories" | "runs" | "level";
type Period = "daily" | "weekly" | "monthly" | "all";

export default function GlobalRanksPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, totalPages: 1, total: 0 });
  const [sortBy, setSortBy] = useState<SortBy>("distance");
  const [period, setPeriod] = useState<Period>("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const leaderboardUpdate = useLeaderboardUpdates();

  const fetchLeaderboard = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const res = await getLeaderboard({
        page: pageNum,
        limit: 20,
        search: search || undefined,
        sortBy,
        period,
      });
      if (res.success) {
        setData(res.data);
        setPagination(res.meta || { page: pageNum, totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(1);
  }, [sortBy, period, leaderboardUpdate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeaderboard(1);
  };

  const formatDistance = (meters: number) => {
    if (!meters) return "0";
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)}k`;
    return `${Math.round(meters)}m`;
  };

  const getSortIcon = (field: SortBy) => sortBy === field ? "↓" : "↕";

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950"><Trophy className="inline-block h-8 w-8 text-yellow-500 mr-2" />Global Leaderboard</h1>
            <p className="mt-2 text-gray-600">Top athletes ranked by distance, points, and territories captured.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-red-600 underline-offset-4 hover:underline">
            Back to dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3 animate-fade-in-up">
          {/* Period */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {(["daily", "weekly", "monthly", "all"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => { setPeriod(p); }}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  period === p ? "bg-red-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p === "all" ? "All Time" : p}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {([
              { key: "distance", label: "Distance" },
              { key: "points", label: "Points" },
              { key: "territories", label: "Territories" },
              { key: "level", label: "Level" },
            ] as { key: SortBy; label: string }[]).map((s) => (
              <button
                key={s.key}
                onClick={() => { setSortBy(s.key); }}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  sortBy === s.key ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s.label} {getSortIcon(s.key)}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search runners..."
              className="h-10 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <button
              type="submit"
              className="h-10 rounded-xl bg-gray-900 px-4 text-xs font-bold text-white hover:bg-gray-800 transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Top 3 Podium */}
        {!isLoading && data.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-3 mb-8 animate-fade-in-up">
            {data.slice(0, 3).map((entry: any, idx: number) => (
              <div
                key={entry._id}
                className={`rounded-2xl p-6 shadow-sm border transition hover:shadow-md ${
                  idx === 0
                    ? "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200"
                    : idx === 1
                    ? "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200"
                    : "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold shadow-md ${
                    idx === 0 ? "bg-yellow-400 text-white" :
                    idx === 1 ? "bg-gray-400 text-white" :
                    "bg-orange-500 text-white"
                  }`}>
                      {idx === 0 ? <Medal className="h-8 w-8 text-yellow-500" /> : idx === 1 ? <Medal className="h-8 w-8 text-gray-400" /> : <Medal className="h-8 w-8 text-orange-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-gray-900 truncate">
                      {entry.firstName} {entry.lastName}
                    </p>
                    <p className="text-sm text-gray-500">@{entry.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-red-600">{entry.totalPoints} pts</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">Lvl {entry.level}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-gray-900">{formatDistance(entry.totalDistance)}</p>
                    <p className="text-xs text-gray-500"><Flag className="inline-block h-3 w-3 mr-1" />{entry.territoriesCaptured}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Rank</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Athlete</th>
                <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Distance</th>
                <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Points</th>
                <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Territories</th>
                <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Runs</th>
                <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Level</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                      <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((entry: any, idx: number) => (
                  <tr
                    key={entry._id}
                    className={`transition hover:bg-red-50 ${
                      user?._id === entry._id ? "bg-red-50/50" : ""
                    } ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                  >
                    <td className="p-4">
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        entry.rank <= 3
                          ? entry.rank === 1 ? "bg-yellow-100 text-yellow-700"
                            : entry.rank === 2 ? "bg-gray-100 text-gray-600"
                            : "bg-orange-100 text-orange-700"
                          : "bg-gray-50 text-gray-500"
                      }`}>
                        {entry.rank <= 3
                          ? entry.rank === 1 ? <Medal className="h-6 w-6 text-yellow-500" />
                            : entry.rank === 2 ? <Medal className="h-6 w-6 text-gray-400" />
                            : <Medal className="h-6 w-6 text-orange-500" />
                          : `#${entry.rank}`}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 text-xs font-bold text-white">
                          {entry.firstName?.[0]}{entry.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {entry.firstName} {entry.lastName}
                            {user?._id === entry._id && (
                              <span className="ml-2 text-[10px] font-bold text-red-600">(You)</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">@{entry.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right text-sm font-semibold text-gray-900">
                      {formatDistance(entry.totalDistance)}
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm font-bold text-red-600">{entry.totalPoints}</span>
                    </td>
                    <td className="p-4 text-right text-sm text-gray-700">{entry.territoriesCaptured}</td>
                    <td className="p-4 text-right text-sm text-gray-700">{entry.totalRuns}</td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-700">
                        {entry.level}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-0">
                    <EmptyState icon={<Trophy className="h-12 w-12 text-gray-400" />} title="No runners found" description="Be the first to claim a spot on the leaderboard." actionLabel="Start Running" actionHref="/runtracker" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between text-sm text-gray-500 animate-fade-in-up">
            <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchLeaderboard(pagination.page - 1)}
                className="h-9 rounded-xl border border-gray-200 px-4 text-xs font-bold uppercase transition hover:bg-gray-50 disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchLeaderboard(pagination.page + 1)}
                className="h-9 rounded-xl border border-gray-200 px-4 text-xs font-bold uppercase transition hover:bg-gray-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

