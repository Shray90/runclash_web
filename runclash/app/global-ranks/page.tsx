"use client";

import Link from "next/link";

// DEV: mock data for UI testing — TODO: replace with API call
const medals = ["🥇", "🥈", "🥉"];

const topAthletes = [
  { id: 1, name: "Sarah Runner", distance: "18.2k", points: 489 },
  { id: 2, name: "Jordan Dx", distance: "12.4k", points: 342 },
  { id: 3, name: "Marcus Thorne", distance: "10.1k", points: 312 },
];

const others = Array.from({ length: 7 }).map((_, i) => ({
  id: i + 4,
  name: `Runner ${i + 4}`,
  distance: `${(9 - i) * 2.1}k`,
  points: Math.floor(200 - i * 10),
}));

export default function GlobalRanksPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">RunClash Leaderboard</h1>
            <p className="mt-2 text-gray-600">Top athletes worldwide — weekly leaderboard.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-red-600 underline-offset-4 hover:underline">
            Back to dashboard
          </Link>
        </div>

        {/* OPTIMIZE: top 3 could be server-side rendered with ISR */}
        <div className="grid gap-6 lg:grid-cols-3">
          {topAthletes.map((a, idx) => (
            <div
              key={a.id}
              className={`card-hover rounded-2xl p-6 shadow-sm ${
                idx === 0
                  ? 'bg-gradient-to-br from-red-50 to-amber-50 border border-red-200'
                  : 'bg-white border border-gray-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 text-white text-lg font-bold shadow-md">
                  {idx === 0 ? '👑' : medals[idx]}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{a.name}</p>
                  <p className="text-sm text-gray-500">
                    {a.distance} • <span className="font-semibold text-red-700">{a.points} pts</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Rank</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Athlete</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Distance</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Points</th>
              </tr>
            </thead>
            <tbody>
              {others.map((r, i) => (
                <tr
                  key={r.id}
                  className={`transition hover:bg-red-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                >
                  <td className="p-4 text-sm font-semibold text-gray-700">#{i + 4}</td>
                  <td className="p-4 text-sm text-gray-900 font-medium">{r.name}</td>
                  <td className="p-4 text-sm text-gray-700">{r.distance}</td>
                  <td className="p-4 text-sm text-gray-700">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
