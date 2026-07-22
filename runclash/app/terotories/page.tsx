"use client";

import Link from "next/link";

// DEV: mock territories — TODO: fetch from API once backend is ready
const territories = [
  { id: 1, name: "Downtown Sector", owner: "You", progress: 78, color: "bg-red-500" },
  { id: 2, name: "Riverside Park", owner: "Squad A", progress: 45, color: "bg-blue-500" },
  { id: 3, name: "Hilltop", owner: "Neutral", progress: 10, color: "bg-green-500" },
];

export default function TerotoriesPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">Territories</h1>
            <p className="mt-2 text-gray-600">View and manage territory control across the map.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-red-600 underline-offset-4 hover:underline">Back to dashboard</Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {/* FIXME: map SDK not implemented — placeholder until Mapbox/Google Maps integration */}
            <div className="h-96 rounded-lg bg-gradient-to-b from-green-50 via-gray-50 to-blue-50 p-4 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-3">🗺️</div>
                <p className="text-gray-400 text-sm font-medium">Interactive Map</p>
                <p className="text-xs text-gray-300 mt-1">Territory visualization coming soon</p>
              </div>
            </div>
          </div>

          <aside className="card-hover rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Territories</h2>
            {/* NOTE: progress bars animate on mount via CSS animation */}
            <div className="mt-4 space-y-4">
              {territories.map((t) => (
                <div key={t.id} className="rounded-lg border border-gray-100 p-4 transition hover:border-gray-200 hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{t.name}</p>
                      <p className="text-sm text-gray-500">
                        Owner:{" "}
                        <span className={`font-medium ${t.owner === "You" ? "text-red-600" : "text-gray-600"}`}>
                          {t.owner}
                        </span>
                      </p>
                    </div>
                    <div className="text-sm font-bold text-gray-900">{t.progress}%</div>
                  </div>
                  <div className="mt-3 h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${t.color} progress-fill`}
                      style={{ width: `${t.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
