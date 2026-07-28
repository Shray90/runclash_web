"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getUserAchievements, getUserBadges } from "@/lib/api/achievements";
import { getRunHistory } from "@/lib/api/run";
import { getUserTerritories } from "@/lib/api/territories";
import { getDashboardStats } from "@/lib/api/stats";
import { getFriendActivity } from "@/lib/api/friends";
import AchievementCelebration from "@/app/_components/AchievementCelebration";
import EmptyState from "@/app/_components/EmptyState";
import { Footprints, Trophy, Flag, Target, Star, Heart, Check, Clock, Medal, BarChart3, Activity, User, Search, Plus, Trash2, Edit3, Save, X, ChevronRight, MapPin, Zap, Flame, BadgeCheck } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [recentRuns, setRecentRuns] = useState<any[]>([]);
  const [territories, setTerritories] = useState<any[]>([]);
  const [friendActivity, setFriendActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "runs" | "achievements" | "territories" | "activity">("overview");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, achRes, badgesRes, runsRes, terrRes, activityRes] = await Promise.allSettled([
          getDashboardStats(),
          getUserAchievements(),
          getUserBadges(),
          getRunHistory({ page: 1, limit: 10 }),
          getUserTerritories(),
          getFriendActivity(),
        ]);
        if (statsRes.status === "fulfilled" && statsRes.value.success) setStats(statsRes.value.data);
        if (achRes.status === "fulfilled" && achRes.value.success) setAchievements(achRes.value.data);
        if (badgesRes.status === "fulfilled" && badgesRes.value.success) setBadges(badgesRes.value.data);
        if (runsRes.status === "fulfilled" && runsRes.value.success) setRecentRuns(runsRes.value.data);
        if (terrRes.status === "fulfilled" && terrRes.value.success) setTerritories(terrRes.value.data);
        if (activityRes.status === "fulfilled" && activityRes.value.success) setFriendActivity(activityRes.value.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDistance = (meters: number) => ((meters || 0) / 1000).toFixed(2);
  const formatPace = (pace: number) => {
    if (!pace) return "--:--";
    const min = Math.floor(pace);
    const sec = Math.round((pace - min) * 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const getLevelProgress = () => {
    if (!stats) return 0;
    const xpInLevel = (stats.xp || 0) % 500;
    return Math.min(100, (xpInLevel / 500) * 100);
  };

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">My Profile</h1>
            <p className="mt-2 text-gray-600">Your stats, achievements, and activity.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-red-600 underline-offset-4 hover:underline">
            Back to dashboard
          </Link>
        </div>

        {/* Profile Header */}
        <div className="mb-8 animate-fade-in-up rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center font-bold text-white text-3xl shadow-md flex-shrink-0">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                `${user?.firstName?.[0] || "R"}${user?.lastName?.[0] || "C"}`
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
              <p className="text-gray-500">@{user?.username}</p>
              <p className="text-sm text-gray-400 mt-1">{user?.bio || "No bio yet"}</p>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-black text-gray-900">{stats?.level || 1}</p>
                <p className="text-xs text-gray-500">Level</p>
              </div>
              <div className="w-px bg-gray-200" />
              <div>
                <p className="text-2xl font-black text-gray-900">{formatDistance(stats?.todaysDistance)}</p>
                <p className="text-xs text-gray-500">Today</p>
              </div>
              <div className="w-px bg-gray-200" />
              <div>
                <p className="text-2xl font-black text-gray-900">{stats?.currentStreak || 0}</p>
                <p className="text-xs text-gray-500">Streak</p>
              </div>
            </div>
          </div>
          {/* XP Bar */}
          {stats && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Level {stats.level}</span>
                <span>{stats.xp} / {stats.level * 500} XP</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-2.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all" style={{ width: `${getLevelProgress()}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 animate-fade-in-up flex-wrap">
          {[
            { key: "overview", label: "Overview" },
            { key: "runs", label: "Runs" },
            { key: "achievements", label: "Achievements" },
            { key: "territories", label: "Territories" },
            { key: "activity", label: "Friend Activity" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                activeTab === tab.key ? "bg-red-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="animate-fade-in-up space-y-6">
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              {[
                { label: "Total Distance", value: `${formatDistance(stats?.totalDistance)} km` },
                { label: "Total Runs", value: stats?.totalRuns || 0 },
                { label: "Calories", value: `${(stats?.totalCalories || 0).toLocaleString()} kcal` },
                { label: "Best Streak", value: <Flame className="inline-block h-5 w-5 text-orange-500 mr-1" /> + `${stats?.currentStreak || 0} days` },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-gray-100 bg-white p-4 text-center">
                  <p className="text-lg font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Badges */}
            {badges.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4"><Medal className="inline-block h-5 w-5 text-yellow-500 mr-2" />Badges</h3>
                <div className="flex flex-wrap gap-3">
                  {badges.map((badge: any) => (
                    <div key={badge._id} className="flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 border border-gray-100">
                      <span className="text-xl"><BadgeCheck className="h-6 w-6 text-gray-400" /></span>
                      <span className="text-sm font-semibold text-gray-700">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Runs */}
            {recentRuns.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Runs</h3>
                <div className="space-y-3">
                  {recentRuns.slice(0, 5).map((run: any) => (
                    <div key={run._id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                      <div>
                        <p className="font-semibold text-gray-900">{formatDistance(run.distance)} km</p>
                        <p className="text-xs text-gray-500">{new Date(run.startTime).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatPace(run.pace)} /km</p>
                        <p className="text-xs text-gray-500">{Math.round(run.calories)} kcal</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Runs Tab */}
        {activeTab === "runs" && (
          <div className="animate-fade-in-up">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Run History</h3>
              {recentRuns.length > 0 ? (
                <div className="space-y-3">
                  {recentRuns.map((run: any) => (
                    <div key={run._id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl"><Footprints className="h-8 w-8 text-red-500" /></span>
                        <div>
                          <p className="font-bold text-gray-900">{formatDistance(run.distance)} km</p>
                          <p className="text-xs text-gray-500">{new Date(run.startTime).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900">{formatPace(run.pace)}</p>
                          <p className="text-xs text-gray-500">Pace</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900">{Math.floor(run.duration / 60)}:{(run.duration % 60).toString().padStart(2, "0")}</p>
                          <p className="text-xs text-gray-500">Time</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900">{Math.round(run.calories)}</p>
                          <p className="text-xs text-gray-500">kcal</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Footprints className="h-12 w-12 text-gray-400" />} title="No runs recorded yet" description="Your run history will appear here after your first run." actionLabel="Start Running" actionHref="/runtracker" />
              )}
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="animate-fade-in-up space-y-6">
            {/* Badges */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4"><Trophy className="inline-block h-5 w-5 text-yellow-500 mr-2" />Earned Badges</h3>
              {badges.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {badges.map((badge: any) => (
                    <div key={badge._id} className="rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition">
                      <span className="text-4xl block mb-2"><Trophy className="h-10 w-10 text-yellow-500" /></span>
                      <p className="font-bold text-gray-900">{badge.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                      <span className={`inline-block mt-2 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase ${
                        badge.rarity === "legendary" ? "bg-yellow-100 text-yellow-700" :
                        badge.rarity === "epic" ? "bg-purple-100 text-purple-700" :
                        badge.rarity === "rare" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{badge.rarity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Trophy className="h-12 w-12 text-gray-400" />} title="No badges earned yet" description="Complete runs and challenges to earn your first badge." actionLabel="Start Running" actionHref="/runtracker" />
              )}
            </div>

            {/* Achievement Progress */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4"><BarChart3 className="inline-block h-5 w-5 mr-2" />Achievement Progress</h3>
              {achievements.length > 0 ? (
                <div className="space-y-4">
                  {achievements.map((ach: any) => (
                    <div key={ach._id} className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${ach.completed ? "bg-green-100" : "bg-gray-100"}`}>
                        {ach.completed ? <Check className="h-6 w-6 text-green-500" /> : <Clock className="h-6 w-6 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{ach.badge?.name || "Achievement"}</p>
                        <div className="mt-1 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                          <div className={`h-2 rounded-full transition-all ${ach.completed ? "bg-green-500" : "bg-red-400"}`} style={{ width: `${ach.progress}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-500">{Math.round(ach.progress)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<BarChart3 className="h-12 w-12 text-gray-400" />} title="No achievements in progress" description="Keep running to unlock achievements and earn badges." actionLabel="View Challenges" actionHref="/challenges" />
              )}
            </div>
          </div>
        )}

        {/* Territories Tab */}
        {activeTab === "territories" && (
          <div className="animate-fade-in-up">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4"><Flag className="inline-block h-5 w-5 mr-2" />Captured Territories</h3>
              {territories.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {territories.map((t: any) => (
                    <div key={t._id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-4">
                      <span className="text-3xl"><Flag className="h-8 w-8 text-red-500" /></span>
                      <div>
                        <p className="font-bold text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-500">Captured {t.totalCaptures} times</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Flag className="h-12 w-12 text-gray-400" />} title="No territories captured yet" description="Run through zones to start building your territory collection." actionLabel="Go to Territories" actionHref="/territories" />
              )}
            </div>
          </div>
        )}

        {/* Friend Activity Tab */}
        {activeTab === "activity" && (
          <div className="animate-fade-in-up">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4"><Activity className="inline-block h-5 w-5 mr-2" />Friend Activity</h3>
              {friendActivity.length > 0 ? (
                <div className="space-y-3">
                  {friendActivity.map((activity: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                          {activity.userId?.firstName?.[0]}{activity.userId?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {activity.userId?.firstName} {activity.userId?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.type === "run" ? <Footprints className="h-5 w-5 text-red-500" /> : <Trophy className="h-5 w-5 text-yellow-500" />} {activity.message}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400">
                  <p className="mb-2">No friend activity yet</p>
                  <Link href="/friends" className="text-sm font-semibold text-red-600 hover:underline">Find friends →</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <AchievementCelebration />
    </main>
  );
}

