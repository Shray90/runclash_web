"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getChallenges, getUserChallenges, joinChallenge, getChallengeHistory, generateDefaultChallenges } from "@/lib/api/challenges";
import ChallengeCelebration from "@/app/_components/ChallengeCelebration";
import EmptyState from "@/app/_components/EmptyState";
import { Target, Footprints, MapPin, Flame, Zap, Trophy, Flag, Coins, Clock, Check, AlertCircle } from "lucide-react";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [myChallenges, setMyChallenges] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "mine" | "history">("all");

  const fetchData = async () => {
    try {
      const [allRes, myRes, histRes] = await Promise.allSettled([
        getChallenges(true),
        getUserChallenges(),
        getChallengeHistory(),
      ]);
      if (allRes.status === "fulfilled" && allRes.value.success) setChallenges(allRes.value.data);
      if (myRes.status === "fulfilled" && myRes.value.success) setMyChallenges(myRes.value.data);
      if (histRes.status === "fulfilled" && histRes.value.success) setHistory(histRes.value.data);
    } catch (err) {
      console.error("Challenges fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleJoin = async (id: string) => {
    try {
      await joinChallenge(id);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleGenerateDefaults = async () => {
    try {
      await generateDefaultChallenges();
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const getProgressColor = (progress: number, goal: number) => {
    const pct = goal > 0 ? (progress / goal) * 100 : 0;
    if (pct >= 100) return "bg-green-500";
    if (pct >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      distance: <Footprints className="h-8 w-8 text-red-500" />,
      runs: <Footprints className="h-8 w-8 text-red-500" />,
      territories: <MapPin className="h-8 w-8 text-blue-500" />,
      streak: <Flame className="h-8 w-8 text-orange-500" />,
      speed: <Zap className="h-8 w-8 text-yellow-500" />,
      calories: <Flame className="h-8 w-8 text-orange-500" />,
      marathon: <Trophy className="h-8 w-8 text-yellow-500" />,
    };
    return icons[type] || <Target className="h-8 w-8 text-red-500" />;
  };

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950"><Target className="inline-block h-8 w-8 text-red-500 mr-2" />Challenges</h1>
            <p className="mt-2 text-gray-600">Complete challenges, earn rewards, and level up.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-red-600 underline-offset-4 hover:underline">Back to dashboard</Link>
        </div>

        <div className="flex gap-2 mb-6 animate-fade-in-up flex-wrap">
          <button onClick={() => setActiveTab("all")} className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${activeTab === "all" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}>Active Challenges ({challenges.length})</button>
          <button onClick={() => setActiveTab("mine")} className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${activeTab === "mine" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}>My Progress ({myChallenges.length})</button>
          <button onClick={() => setActiveTab("history")} className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${activeTab === "history" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}>History ({history.length})</button>
          <button onClick={handleGenerateDefaults} className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition ml-auto">Generate Defaults</button>
        </div>

        {activeTab === "all" && (
          <div className="animate-fade-in-up grid gap-4 md:grid-cols-2">
            {isLoading ? (
              [1, 2, 3, 4].map((i) => <div key={i} className="skeleton-shimmer h-48 rounded-2xl" />)
            ) : challenges.length > 0 ? (
              challenges.map((challenge: any) => (
                <div key={challenge._id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{getTypeIcon(challenge.type)}</span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase text-gray-600">{challenge.type}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{challenge.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className="font-semibold text-gray-700">Goal: {challenge.goal} {challenge.type === "distance" ? "km" : challenge.type === "calories" ? "kcal" : ""}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-3 text-xs">
                      <span className="text-yellow-600"><Trophy className="inline-block h-4 w-4 mr-1" />{challenge.reward?.xp} XP</span>
                      <span className="text-gray-500"><Coins className="inline-block h-4 w-4 mr-1" />{challenge.reward?.coins} coins</span>
                    </div>
                    <button onClick={() => handleJoin(challenge._id)} className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition">Join</button>
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    Ends {new Date(challenge.endDate).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2">
                <EmptyState icon={<Target className="h-12 w-12 text-gray-400" />} title="No active challenges" description="New challenges appear here regularly. Check back soon!" />
              </div>
            )}
          </div>
        )}

        {activeTab === "mine" && (
          <div className="animate-fade-in-up space-y-4">
            {myChallenges.length > 0 ? (
              myChallenges.map((entry: any) => {
                const c = entry.challenge || entry.challengeId;
                if (!c) return null;
                const progress = entry.progress || 0;
                const goal = c.goal || 1;
                const pct = Math.min(100, (progress / goal) * 100);
                return (
                  <div key={entry._id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getTypeIcon(c.type)}</span>
                        <div>
                          <p className="font-bold text-gray-900">{c.title}</p>
                          <p className="text-xs text-gray-500">{c.description}</p>
                        </div>
                      </div>
                      {entry.completed ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700"><Check className="inline-block h-3 w-3 mr-1" />Completed</span>
                      ) : (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">In Progress</span>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{progress} / {goal} {c.type === "distance" ? "km" : ""}</span>
                        <span className="font-bold text-gray-900">{Math.round(pct)}%</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-3 rounded-full transition-all ${getProgressColor(progress, goal)}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="mt-3 flex gap-3 text-xs">
                      <span className="text-yellow-600"><Trophy className="inline-block h-3 w-3 mr-1" />{c.reward?.xp} XP</span>
                      <span className="text-gray-500"><Coins className="inline-block h-3 w-3 mr-1" />{c.reward?.coins} coins</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400">
                <EmptyState icon={<Target className="h-12 w-12 text-gray-400" />} title="No challenges joined yet" description="Browse active challenges and join one to start earning rewards." actionLabel="Browse Challenges" actionHref="#" onAction={() => setActiveTab("all")} />
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="animate-fade-in-up space-y-4">
            {history.length > 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Challenge</th>
                      <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Type</th>
                      <th className="p-4 text-right text-xs font-bold uppercase text-gray-500">Progress</th>
                      <th className="p-4 text-right text-xs font-bold uppercase text-gray-500">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry: any) => {
                      const c = entry.challenge || entry.challengeId;
                      if (!c) return null;
                      return (
                        <tr key={entry._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="p-4 text-sm font-semibold text-gray-900">{c.title}</td>
                          <td className="p-4 text-xs text-gray-600 capitalize">{c.type}</td>
                          <td className="p-4 text-right text-sm text-gray-700">{Math.round(entry.progress || 0)} / {c.goal}</td>
                          <td className="p-4 text-right text-xs text-gray-500">{entry.completedAt ? new Date(entry.completedAt).toLocaleDateString() : "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400">
                <EmptyState icon={<FileText className="h-12 w-12 text-gray-400" />} title="No challenge history yet" description="Complete challenges to build your history." actionLabel="Browse Challenges" actionHref="#" onAction={() => setActiveTab("all")} />
              </div>
            )}
          </div>
        )}
      </div>
      <ChallengeCelebration />
    </main>
  );
}

