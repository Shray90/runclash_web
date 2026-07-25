"use client";

import { useEffect, useState } from "react";
import { getAllBadges, createBadge as apiCreateBadge } from "@/lib/api/achievements";

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "🏅",
    criteriaType: "distance",
    criteriaValue: "",
    rarity: "common",
    color: "#6b7280",
    xpReward: "50",
    coinReward: "25",
  });

  const fetchBadges = async () => {
    try {
      const res = await getAllBadges();
      if (res.success) setBadges(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiCreateBadge({
        name: form.name,
        description: form.description,
        icon: form.icon,
        criteria: { type: form.criteriaType, value: Number(form.criteriaValue) },
        rarity: form.rarity,
        color: form.color,
        xpReward: Number(form.xpReward),
        coinReward: Number(form.coinReward),
      });
      setShowForm(false);
      setForm({ name: "", description: "", icon: "🏅", criteriaType: "distance", criteriaValue: "", rarity: "common", color: "#6b7280", xpReward: "50", coinReward: "25" });
      fetchBadges();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const rarityColor: Record<string, string> = {
    common: "bg-gray-100 text-gray-700",
    rare: "bg-blue-100 text-blue-700",
    epic: "bg-purple-100 text-purple-700",
    legendary: "bg-yellow-100 text-yellow-700",
  };

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">🎖️ Admin Badges</h1>
            <p className="mt-2 text-gray-600">Manage badges and achievements.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition">+ New Badge</button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create Badge</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">Name</label>
                <input className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">Icon</label>
                <input className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} required />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-gray-600">Description</label>
                <input className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">Criteria Type</label>
                <select className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm" value={form.criteriaType} onChange={(e) => setForm({ ...form, criteriaType: e.target.value })}>
                  <option value="distance">Distance (km)</option>
                  <option value="runs">Runs</option>
                  <option value="territories">Territories</option>
                  <option value="streak">Streak</option>
                  <option value="speed">Speed (min/km)</option>
                  <option value="calories">Calories</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">Criteria Value</label>
                <input type="number" className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm" value={form.criteriaValue} onChange={(e) => setForm({ ...form, criteriaValue: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">Rarity</label>
                <select className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm" value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value })}>
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">Color</label>
                <input type="color" className="h-10 w-full rounded-xl border border-gray-200 px-1 text-sm" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">XP Reward</label>
                <input type="number" className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">Coin Reward</label>
                <input type="number" className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm" value={form.coinReward} onChange={(e) => setForm({ ...form, coinReward: e.target.value })} required />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button type="submit" className="rounded-full bg-gray-900 px-6 py-2 text-sm font-bold text-white hover:bg-gray-800 transition">Create Badge</button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold hover:bg-gray-50 transition">Cancel</button>
            </div>
          </form>
        )}

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm animate-fade-in-up">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton-shimmer h-20 rounded-xl" />)}</div>
          ) : badges.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge: any) => (
                <div key={badge._id} className="rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{badge.icon || "🏅"}</span>
                    <div>
                      <p className="font-bold text-gray-900">{badge.name}</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${rarityColor[badge.rarity] || rarityColor.common}`}>{badge.rarity}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{badge.description}</p>
                  <p className="text-xs text-gray-400 mt-2">Criteria: {badge.criteria?.type} = {badge.criteria?.value}</p>
                  <p className="text-xs text-gray-400">{badge.xpReward} XP / {badge.coinReward} coins</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400">No badges created yet</div>
          )}
        </div>
      </div>
    </main>
  );
}
