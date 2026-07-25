"use client";

import { useEffect, useState } from "react";
import {
  getChallenges,
  createChallenge as apiCreateChallenge,
  updateChallenge as apiUpdateChallenge,
  deleteChallenge as apiDeleteChallenge,
} from "@/lib/api/challenges";
import Link from "next/link";

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "distance",
    goal: "",
    rewardXp: "100",
    rewardCoins: "50",
    startDate: "",
    endDate: "",
  });

  const fetchChallenges = async () => {
    try {
      const res = await getChallenges(false);
      if (res.success) setChallenges(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      type: form.type,
      goal: Number(form.goal),
      reward: { xp: Number(form.rewardXp), coins: Number(form.rewardCoins) },
      startDate: form.startDate,
      endDate: form.endDate,
    };

    try {
      if (editingId) {
        await apiUpdateChallenge(editingId, payload);
      } else {
        await apiCreateChallenge(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ title: "", description: "", type: "distance", goal: "", rewardXp: "100", rewardCoins: "50", startDate: "", endDate: "" });
      fetchChallenges();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (c: any) => {
    setEditingId(c._id);
    setForm({
      title: c.title,
      description: c.description,
      type: c.type,
      goal: String(c.goal),
      rewardXp: String(c.reward?.xp || 0),
      rewardCoins: String(c.reward?.coins || 0),
      startDate: c.startDate ? c.startDate.slice(0, 10) : "",
      endDate: c.endDate ? c.endDate.slice(0, 10) : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this challenge?")) return;
    try {
      await apiDeleteChallenge(id);
      fetchChallenges();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">🎯 Admin Challenges</h1>
            <p className="mt-2 text-gray-600">Create and manage challenges.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/users" className="text-sm font-semibold text-gray-600 underline-offset-4 hover:underline">Users</Link>
            <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: "", description: "", type: "distance", goal: "", rewardXp: "100", rewardCoins: "50", startDate: "", endDate: "" }); }} className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition">+ New Challenge</button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? "Edit Challenge" : "Create Challenge"}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">Title</label>
                <input className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">Type</label>
                <select className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="distance">Distance</option>
                  <option value="runs">Runs</option>
                  <option value="territories">Territories</option>
                  <option value="streak">Streak</option>
                  <option value="calories">Calories</option>
                  <option value="speed">Speed</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">Goal</label>
                <input type="number" className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">Description</label>
                <input className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">Start Date</label>
                <input type="date" className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">End Date</label>
                <input type="date" className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">XP Reward</label>
                <input type="number" className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm" value={form.rewardXp} onChange={(e) => setForm({ ...form, rewardXp: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">Coins Reward</label>
                <input type="number" className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm" value={form.rewardCoins} onChange={(e) => setForm({ ...form, rewardCoins: e.target.value })} required />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button type="submit" className="rounded-full bg-gray-900 px-6 py-2 text-sm font-bold text-white hover:bg-gray-800 transition">{editingId ? "Update" : "Create"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold hover:bg-gray-50 transition">Cancel</button>
            </div>
          </form>
        )}

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm animate-fade-in-up">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton-shimmer h-20 rounded-xl" />)}</div>
          ) : challenges.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Title</th>
                    <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Type</th>
                    <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Goal</th>
                    <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Rewards</th>
                    <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">Date Range</th>
                    <th className="p-4 text-right text-xs font-bold uppercase text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {challenges.map((c) => (
                    <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="p-4 text-sm font-semibold text-gray-900">{c.title}</td>
                      <td className="p-4 text-xs text-gray-600 capitalize">{c.type}</td>
                      <td className="p-4 text-sm text-gray-700">{c.goal}</td>
                      <td className="p-4 text-xs text-gray-600">{c.reward?.xp} XP / {c.reward?.coins} coins</td>
                      <td className="p-4 text-xs text-gray-600">{new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleEdit(c)} className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700 hover:bg-gray-200 transition mr-2">Edit</button>
                        <button onClick={() => handleDelete(c._id)} className="rounded-lg border border-red-200 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-50 transition">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400">No challenges found</div>
          )}
        </div>
      </div>
    </main>
  );
}
