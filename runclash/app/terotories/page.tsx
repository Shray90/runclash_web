"use client";

import Link from "next/link";

const territories = [
  { id: 1, name: "Downtown Sector", owner: "You", progress: 78 },
  { id: 2, name: "Riverside Park", owner: "Squad A", progress: 45 },
  { id: 3, name: "Hilltop", owner: "Neutral", progress: 10 },
];

export default function TerotoriesPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">Territories</h1>
            <p className="mt-2 text-gray-600">View and manage territory control across the map.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-sky-600 underline">Back to dashboard</Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="h-96 rounded-lg bg-gray-50 p-4 text-gray-400">Interactive map placeholder</div>
          </div>

          <aside className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Territories</h2>
            <div className="mt-4 space-y-4">
              {territories.map((t) => (
                <div key={t.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{t.name}</p>
                      <p className="text-sm text-gray-500">Owner: {t.owner}</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{t.progress}%</div>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-red-500" style={{ width: `${t.progress}%` }} />
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
