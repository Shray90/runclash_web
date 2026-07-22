"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function RuntrackerPage() {
  const [running, setRunning] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<number | null>(null);

  function startRun() {
    if (running) return;
    setRunning(true);
    // FIXME: this interval leaks on unmount — needs cleanup effect
    timerRef.current = window.setInterval(() => {
      setDuration((s) => s + 1);
      setDistance((d) => d + 0.02);
    }, 1000);
  }

  // HACK: cleanup interval on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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
        <div className="mb-6 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">Runtracker</h1>
            <p className="mt-2 text-gray-600">Record runs, see live stats and export activities.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-red-600 underline-offset-4 hover:underline">
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="col-span-2 card-hover rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {/* TODO: integrate actual map SDK (Google Maps / Mapbox) for GPS view */}
            <div className="h-80 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-3">📍</div>
                <p className="text-gray-400 text-sm font-medium">Map / sensor live view</p>
                <p className="text-xs text-gray-300 mt-1">GPS data incoming...</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                className={`rounded-full px-6 py-3 text-white font-semibold transition-all ${
                  running
                    ? 'bg-red-600 hover:bg-red-700 glow-active'
                    : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                }`}
                onClick={running ? stopRun : startRun}
              >
                {running ? '⏹ Stop' : '▶ Start'} Run
              </button>
              <button className="rounded-full border border-gray-300 px-4 py-3 font-semibold transition hover:bg-gray-50 hover:border-gray-400" onClick={reset}>
                Reset
              </button>
            </div>
          </div>

          <aside className="card-hover rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Live Stats</p>
                {running && <span className="animate-pulse-soft h-2 w-2 rounded-full bg-red-500 inline-block" />}
              </div>
              <p className="mt-3 text-3xl font-extrabold text-gray-900">{distance.toFixed(2)} km</p>
              <p className="mt-1 text-sm text-gray-600">
                Duration: {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <div className={`rounded-lg p-3 ${running ? 'bg-red-50' : 'bg-gray-50'}`}>
                <p className="text-xs text-gray-600">Pace</p>
                <p className="font-bold text-gray-900">5:12 / km</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-600">Calories</p>
                <p className="font-bold text-gray-900">{Math.round(distance * 60)} kcal</p>
              </div>
            </div>

            {/* DEV: placeholder for future activity table */}
            <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 italic">Recent activities will appear here</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
