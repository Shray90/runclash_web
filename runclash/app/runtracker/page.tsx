"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRunTracker } from "@/lib/hooks/useRunTracker";

const MapComponent = dynamic(() => import("./_components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-96 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-3">🗺️</div>
        <p className="text-gray-400 text-sm font-medium">Loading map...</p>
      </div>
    </div>
  ),
});

export default function RuntrackerPage() {
  const {
    status,
    runId,
    distance,
    duration,
    pace,
    avgSpeed,
    calories,
    route,
    smoothedRoute,
    gpsAccuracy,
    lastLocationSent,
    autoPaused,
    offlineQueueSize,
    startRun,
    pauseRun,
    resumeRun,
    stopRun,
  } = useRunTracker();

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPace = (p: number) => {
    if (!p || p === Infinity) return "--:--";
    const min = Math.floor(p);
    const sec = Math.round((p - min) * 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const formatLastSync = () => {
    if (!lastLocationSent) return "--";
    const diff = now - lastLocationSent;
    if (diff < 5000) return "Just now";
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    return `${Math.floor(diff / 60000)}m ago`;
  };

  const getGpsSignalColor = () => {
    if (gpsAccuracy === null) return "text-gray-400 bg-gray-50";
    if (gpsAccuracy <= 10) return "text-green-600 bg-green-50";
    if (gpsAccuracy <= 30) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getGpsSignalLabel = () => {
    if (gpsAccuracy === null) return "GPS Idle";
    if (gpsAccuracy <= 10) return "Strong GPS";
    if (gpsAccuracy <= 30) return "Weak GPS";
    return "Poor GPS";
  };

  const gpsSignal = getGpsSignalColor();
  const gpsLabel = getGpsSignalLabel();

  const handleStart = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        setIsProcessing(false);
        return;
      }
      await startRun();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to start run. Check location permissions.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePause = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      await pauseRun();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to pause run");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResume = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      await resumeRun();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to resume run");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStop = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      await stopRun();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to finish run");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">Run Tracker</h1>
            <p className="mt-2 text-gray-600">Record runs, track your route in real-time, and see live stats.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-red-600 underline-offset-4 hover:underline">
            Back to dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 animate-fade-in-up rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="col-span-2 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="h-96">
                <MapComponent route={route} isActive={status === "active"} smoothedRoute={smoothedRoute} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              {status === "idle" && (
                <button
                  onClick={handleStart}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-full bg-green-600 px-8 py-3 text-white font-semibold transition hover:bg-green-700 hover:shadow-lg disabled:opacity-50"
                >
                  {isProcessing ? "Starting..." : "▶ Start Run"}
                </button>
              )}

              {status === "active" && (
                <>
                  <button
                    onClick={handlePause}
                    disabled={isProcessing}
                    className="flex items-center gap-2 rounded-full bg-yellow-500 px-6 py-3 text-white font-semibold transition hover:bg-yellow-600 hover:shadow-lg disabled:opacity-50"
                  >
                    ⏸ Pause
                  </button>
                  <button
                    onClick={handleStop}
                    disabled={isProcessing}
                    className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-white font-semibold transition hover:bg-red-700 hover:shadow-lg disabled:opacity-50"
                  >
                    ⏹ Stop Run
                  </button>
                  <span className="flex items-center gap-2 ml-2">
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="inline-flex h-3 w-3 rounded-full bg-red-500" />
                    </span>
                    <span className="text-sm font-semibold text-red-600">Recording</span>
                  </span>
                </>
              )}

              {status === "paused" && (
                <>
                  <button
                    onClick={handleResume}
                    disabled={isProcessing}
                    className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-white font-semibold transition hover:bg-green-700 hover:shadow-lg disabled:opacity-50"
                  >
                    ▶ Resume
                  </button>
                  <button
                    onClick={handleStop}
                    disabled={isProcessing}
                    className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-white font-semibold transition hover:bg-red-700 hover:shadow-lg disabled:opacity-50"
                  >
                    ⏹ Stop Run
                  </button>
                  <span className="text-sm font-semibold text-yellow-600 ml-2">
                    {autoPaused ? "⏸ Auto Paused (no movement)" : "⏸ Paused"}
                  </span>
                </>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Live Stats</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${gpsSignal}`}>
                    {gpsLabel}
                  </span>
                  {status === "active" && (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                  )}
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-5xl font-black text-gray-900">
                  {(distance / 1000).toFixed(2)}
                  <span className="text-lg font-normal text-gray-400 ml-1">km</span>
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 mb-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Duration</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatDuration(duration)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-lg p-3 ${status === "active" ? "bg-red-50" : "bg-gray-50"}`}>
                  <p className="text-xs text-gray-500">Pace</p>
                  <p className="text-lg font-bold text-gray-900">{formatPace(pace)} /km</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Avg Speed</p>
                  <p className="text-lg font-bold text-gray-900">{avgSpeed.toFixed(1)} km/h</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Calories</p>
                  <p className="text-lg font-bold text-gray-900">{calories} kcal</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Points</p>
                  <p className="text-lg font-bold text-gray-900">{Math.round(distance / 10)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Route Info</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">GPS Points</span>
                  <span className="font-semibold text-gray-900">{route.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-semibold ${
                    status === "active" ? "text-green-600" :
                    status === "paused" ? "text-yellow-600" : "text-gray-400"
                  }`}>
                    {status === "idle" ? "Ready" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Sync</span>
                  <span className="font-mono text-xs text-gray-400">{formatLastSync()}</span>
                </div>
                {offlineQueueSize > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Offline Queue</span>
                    <span className="font-mono text-xs text-orange-600">{offlineQueueSize} pending</span>
                  </div>
                )}
                {gpsAccuracy !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">GPS Accuracy</span>
                    <span className="font-mono text-xs text-gray-400">±{gpsAccuracy.toFixed(1)}m</span>
                  </div>
                )}
                {runId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Run ID</span>
                    <span className="font-mono text-xs text-gray-400">{runId.slice(-8)}</span>
                  </div>
                )}
              </div>
            </div>

            {route.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Current Position</p>
                <div className="space-y-1 text-xs font-mono text-gray-600">
                  <p>Lat: {route[route.length - 1].lat.toFixed(6)}</p>
                  <p>Lng: {route[route.length - 1].lng.toFixed(6)}</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
