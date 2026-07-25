"use client";

import { useEffect, useState } from "react";
import { getAdminAnalytics } from "@/lib/api/stats";

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

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">📊 Admin Analytics</h1>
            <p className="mt-2 text-gray-600">Platform-wide metrics and insights.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="skeleton-shimmer h-32 rounded-2xl" />
            ))}
          </div>
        ) : analytics ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up">
            {[
              { label: "Total Users", value: analytics.totalUsers, sub: `+${analytics.newUsersThisMonth} this month` },
              { label: "Total Runs", value: analytics.totalRuns, sub: `+${analytics.runsThisMonth} this month` },
              { label: "Territories", value: `${analytics.capturedTerritories}/${analytics.totalTerritories}`, sub: "captured" },
              { label: "Notifications", value: analytics.totalNotifications, sub: "total" },
              { label: "Active Challenges", value: analytics.activeChallenges, sub: "currently active" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{item.label}</p>
                <p className="mt-2 text-3xl font-black text-gray-900">{item.value}</p>
                <p className="mt-1 text-xs text-gray-400">{item.sub}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">No analytics data available</div>
        )}
      </div>
    </main>
  );
}
