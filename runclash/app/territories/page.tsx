"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getAllTerritories, checkCapture, getUserTerritories } from "@/lib/api/territories";
import { useTerritoryUpdates } from "@/lib/hooks/useSocket";
import { useAuth } from "@/lib/contexts/AuthContext";
import dynamic from "next/dynamic";
import EmptyState from "@/app/_components/EmptyState";

const TerritoryMap = dynamic(() => import("./_components/TerritoryMap"), {
  ssr: false,
  loading: () => (
    <div className="h-96 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-3">🗺️</div>
        <p className="text-gray-400 text-sm font-medium">Loading map...</p>
      </div>
    </div>
  ),
});

interface Territory {
  _id: string;
  name: string;
  center: { coordinates: [number, number] };
  radius: number;
  owner?: { _id: string; firstName: string; lastName: string; username: string; profileImage?: string };
  captureProgress: number;
  totalCaptures: number;
  pointsRequired: number;
  color: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  isActive: boolean;
}

interface CaptureState {
  territoryId: string;
  territoryName: string;
  progress: number;
  isCapturing: boolean;
  xpReward: number;
  coinReward: number;
}

export default function TerritoriesPage() {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [myTerritories, setMyTerritories] = useState<Territory[]>([]);
  const [captureState, setCaptureState] = useState<CaptureState | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
const [showCaptureComplete, setShowCaptureComplete] = useState(false);
  const [lastCaptureResult, setLastCaptureResult] = useState<any>(null);

  const { user } = useAuth();
  const territoryUpdate = useTerritoryUpdates();

  const fetchTerritories = useCallback(async () => {
    try {
      const [allRes, myRes] = await Promise.allSettled([
        getAllTerritories(),
        getUserTerritories(),
      ]);
      if (allRes.status === "fulfilled" && allRes.value.success) setTerritories(allRes.value.data);
      if (myRes.status === "fulfilled" && myRes.value.success) setMyTerritories(myRes.value.data);
    } catch (err) {
      console.error("Territories fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTerritories();
  }, [fetchTerritories]);

  useEffect(() => {
    if (territoryUpdate) {
      fetchTerritories();
    }
  }, [territoryUpdate, fetchTerritories]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const displayedTerritories = activeTab === "all" ? territories : myTerritories;

  const handleCapture = async (territoryId: string) => {
    if (!userPosition) {
      alert("Enable location to capture territories");
      return;
    }
    setIsCapturing(true);
    try {
      const res = await checkCapture({
        territoryId,
        lat: userPosition.lat,
        lng: userPosition.lng,
      });
      if (res.success) {
        const data = res.data;
        if (data.captured) {
          setLastCaptureResult(data);
          setShowCaptureComplete(true);
          setCaptureState(null);
        } else {
          setCaptureState({
            territoryId,
            territoryName: data.territory?.name || "",
            progress: data.progress,
            isCapturing: data.inside && data.progress < 100,
            xpReward: data.territory?.xpReward || 100,
            coinReward: data.territory?.coinReward || 50,
          });
        }
        fetchTerritories();
      }
    } catch (err: any) {
      alert(err.message || "Capture failed");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">🗺️ Territories</h1>
            <p className="mt-2 text-gray-600">Capture territory by running through it. Dominate the map.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-red-600 underline-offset-4 hover:underline">
            Back to dashboard
          </Link>
        </div>

        {/* Capture complete notification */}
        {showCaptureComplete && lastCaptureResult && (
          <div className="mb-6 animate-fade-in-up rounded-2xl border border-green-300 bg-green-50 p-5">
            <div className="text-center">
              <p className="text-2xl font-black text-green-800">🎉 Territory Captured!</p>
              <p className="mt-2 text-green-700 font-semibold">{lastCaptureResult.territory?.name}</p>
              <div className="mt-3 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <span className="font-bold text-green-800">+{lastCaptureResult.xpRewarded || 100} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🪙</span>
                  <span className="font-bold text-green-800">+{lastCaptureResult.coinRewarded || 50} Coins</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏆</span>
                  <span className="font-bold text-green-800">+1 Territory</span>
                </div>
              </div>
              <button
                onClick={() => setShowCaptureComplete(false)}
                className="mt-4 rounded-full bg-green-600 px-6 py-2 text-sm font-bold text-white hover:bg-green-700 transition"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Capture progress card */}
        {captureState && !showCaptureComplete && (
          <div className="mb-6 animate-fade-in-up rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-blue-800 text-lg">Capturing...</p>
                <p className="text-sm text-blue-600 mt-1">{captureState.territoryName}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-blue-800">{captureState.progress}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-4 rounded-full bg-blue-100 overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-400 to-blue-600"
                  style={{ width: `${captureState.progress}%` }}
                />
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-4 w-2 rounded-full ${
                      i < Math.floor(captureState.progress / 10) ? "bg-blue-600" : "bg-blue-200"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-blue-500">Rewards: ⚡ {captureState.xpReward} XP • 🪙 {captureState.coinReward} Coins</p>
              <button
                onClick={() => setCaptureState(null)}
                className="text-xs text-blue-400 hover:text-blue-600 font-semibold"
              >
                ✕ Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Map Section */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="h-96">
                <TerritoryMap
                territories={territories}
                userPosition={userPosition}
                currentUserId={user?._id}
              />
            </div>
          </div>

          {/* Territory List */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "all" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All Territories ({territories.length})
              </button>
              <button
                onClick={() => setActiveTab("mine")}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "mine" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                My Territories ({myTerritories.length})
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="skeleton-shimmer h-28 rounded-xl" />
                ))
              ) : displayedTerritories.length > 0 ? (
                displayedTerritories.map((t) => (
                  <div
                    key={t._id}
                    className="rounded-xl border p-4 transition cursor-pointer hover:shadow-md border-gray-100 bg-white hover:border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{t.icon || "🏁"}</span>
                        <div>
                          <p className="font-semibold text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-500">
                            {t.owner
                              ? t.owner._id === user?._id
                                ? "Your territory"
                                : `Owned by ${t.owner.firstName} ${t.owner.lastName}`
                              : "Neutral"}
                          </p>
                        </div>
                      </div>
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                        style={{ backgroundColor: (t.color || "#ef4444") + "20", color: t.color || "#ef4444" }}
                      >
                        {t.totalCaptures}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${t.captureProgress}%`,
                            backgroundColor: t.color || "#ef4444",
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-500">{t.captureProgress}%</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCapture(t._id);
                        }}
                        disabled={isCapturing}
                        className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
                      >
                        {isCapturing ? "..." : "Capture"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={activeTab === "mine" ? "🏁" : "🗺️"}
                  title={activeTab === "mine" ? "No territories captured yet" : "No territories available"}
                  description={activeTab === "mine" ? "Start running to capture your first territory." : "Check back later for new territories."}
                  actionLabel={activeTab === "mine" ? "Go for a run" : undefined}
                  actionHref={activeTab === "mine" ? "/runtracker" : undefined}
                />
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

