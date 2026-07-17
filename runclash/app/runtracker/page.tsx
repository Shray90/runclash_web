"use client";

import Link from "next/link";
import { useState, useRef } from "react";

export default function RuntrackerPage() {
  const [running, setRunning] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<number | null>(null);

  function startRun() {
    if (running) return;
    setRunning(true);
    timerRef.current = window.setInterval(() => {
      setDuration((s) => s + 1);
      setDistance((d) => d + 0.02);
    }, 1000);
  }

  function stopRun() {
    setRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function reset() {
    stopRun();
    setDistance(0);
    setDuration(0);
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">Runtracker</h1>
            <p className="mt-2 text-gray-600">Record runs, see live stats and export activities.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-sky-600 underline">
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="h-80 rounded-lg bg-gray-50 p-4 text-gray-400">Map / sensor live view (placeholder)</div>
            <div className="mt-4 flex items-center gap-3">
              <button className={`rounded-full px-6 py-3 text-white font-semibold ${running ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`} onClick={running ? stopRun : startRun}>
                {running ? 'Stop' : 'Start'} Run
              </button>
              <button className="rounded-full border px-4 py-3 font-semibold" onClick={reset}>Reset</button>
            </div>
          </div>

          <aside className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Live Stats</p>
              <p className="mt-3 text-2xl font-extrabold text-gray-900">{distance.toFixed(2)} km</p>
              <p className="mt-1 text-sm text-gray-600">Duration: {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-xs text-gray-600">Pace</p>
                <p className="font-bold text-gray-900">5:12 / km</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-600">Calories</p>
                <p className="font-bold text-gray-900">{Math.round(distance * 60)} kcal</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
