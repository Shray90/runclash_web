"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getFriends, getFriendRequests, getSentRequests, sendFriendRequest, respondToRequest, removeFriend, compareStats, getFriendActivity } from "@/lib/api/friends";
import { searchUsers } from "@/lib/api/users";
import { useOnlineFriends } from "@/lib/hooks/useSocket";
import EmptyState from "@/app/_components/EmptyState";
import { Users, UserPlus, UserCheck, MessageCircle, BarChart3, X, Mail, Activity, Flag, MapPin, Trophy, Bell, AlertCircle } from "lucide-react";

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "search" | "activity">("friends");
  const [isLoading, setIsLoading] = useState(true);
  const [comparison, setComparison] = useState<any>(null);
  const [friendActivity, setFriendActivity] = useState<any[]>([]);
  const onlineFriends = useOnlineFriends();

  const fetchData = async () => {
    try {
      const [friendsRes, requestsRes, sentRes] = await Promise.allSettled([
        getFriends(),
        getFriendRequests(),
        getSentRequests(),
      ]);
      if (friendsRes.status === "fulfilled" && friendsRes.value.success) setFriends(friendsRes.value.data);
      if (requestsRes.status === "fulfilled" && requestsRes.value.success) setRequests(requestsRes.value.data);
      if (sentRes.status === "fulfilled" && sentRes.value.success) setSentRequests(sentRes.value.data);
    } catch (err) {
      console.error("Friends fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await searchUsers({ search: searchQuery, page: 1, limit: 10 });
      if (res.success) setSearchResults(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSendRequest = async (receiverId: string) => {
    try {
      await sendFriendRequest(receiverId);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleRespond = async (requestId: string, action: "accept" | "reject") => {
    try {
      await respondToRequest(requestId, action);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleRemove = async (friendId: string) => {
    if (!confirm("Remove this friend?")) return;
    try {
      await removeFriend(friendId);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleCompare = async (friendId: string) => {
    try {
      const res = await compareStats(friendId);
      if (res.success) setComparison(res.data);
    } catch (err: any) { alert(err.message); }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950"><Users className="inline-block h-8 w-8 text-red-500 mr-2" />Friends</h1>
            <p className="mt-2 text-gray-600">Connect with runners, compare stats, and compete.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-red-600 underline-offset-4 hover:underline">Back to dashboard</Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 animate-fade-in-up flex-wrap">
          <button onClick={() => setActiveTab("friends")} className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${activeTab === "friends" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            Friends ({friends.length})
          </button>
          <button onClick={() => setActiveTab("requests")} className={`rounded-xl px-5 py-2.5 text-sm font-bold transition relative ${activeTab === "requests" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            Requests
            {requests.length > 0 && <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{requests.length}</span>}
          </button>
          <button onClick={() => setActiveTab("search")} className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${activeTab === "search" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            Find Friends
          </button>
          <button onClick={() => setActiveTab("activity")} className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${activeTab === "activity" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            Activity Feed
          </button>
        </div>

        {/* Friends List */}
        {activeTab === "friends" && (
          <div className="animate-fade-in-up">
            {comparison && (
              <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900"><BarChart3 className="inline-block h-5 w-5 mr-2" />Stats Comparison</h3>
                  <button onClick={() => setComparison(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Distance", user: (comparison.user.totalDistance / 1000).toFixed(1) + "km", friend: (comparison.friend.totalDistance / 1000).toFixed(1) + "km" },
                    { label: "Runs", user: comparison.user.totalRuns, friend: comparison.friend.totalRuns },
                    { label: "Level", user: comparison.user.level, friend: comparison.friend.level },
                    { label: "Territories", user: comparison.user.territoriesCaptured, friend: comparison.friend.territoriesCaptured },
                    { label: "Longest Run", user: (comparison.user.longestRun / 1000).toFixed(1) + "km", friend: (comparison.friend.longestRun / 1000).toFixed(1) + "km" },
                    { label: "Streak", user: comparison.user.currentStreak + " days", friend: comparison.friend.currentStreak + " days" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-gray-100 p-3 text-center">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-bold text-gray-900">{item.user} vs {item.friend}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Friends ({friends.length})</h3>
              {friends.length > 0 ? (
                <div className="space-y-3">
                  {friends.map((friend: any) => (
                    <div key={friend._id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold">
                            {friend.firstName?.[0]}{friend.lastName?.[0]}
                          </div>
                          {onlineFriends.includes(friend._id) && (
                            <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{friend.firstName} {friend.lastName}</p>
                          <p className="text-xs text-gray-500">@{friend.username}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleCompare(friend._id)} className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold hover:bg-gray-200 transition">Compare</button>
                        <button onClick={() => handleRemove(friend._id)} className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Users className="h-12 w-12 text-gray-400" />} title="No friends yet" description="Find runners and add them as friends to compare stats." actionLabel="Find Friends" actionHref="#search" />
              )}
            </div>

            {sentRequests.length > 0 && (
              <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Sent Requests</h3>
                <div className="space-y-2">
                  {sentRequests.map((req: any) => (
                    <div key={req._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <p className="text-sm font-medium text-gray-700">{req.receiver?.firstName} {req.receiver?.lastName}</p>
                      <span className="text-xs text-gray-400 capitalize">{req.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Requests */}
        {activeTab === "requests" && (
          <div className="animate-fade-in-up rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Friend Requests ({requests.length})</h3>
            {requests.length > 0 ? (
              <div className="space-y-3">
                {requests.map((req: any) => (
                  <div key={req._id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {req.sender?.firstName?.[0]}{req.sender?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{req.sender?.firstName} {req.sender?.lastName}</p>
                        <p className="text-xs text-gray-500">@{req.sender?.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleRespond(req._id, "accept")} className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-green-700 transition">Accept</button>
                      <button onClick={() => handleRespond(req._id, "reject")} className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-semibold hover:bg-gray-50 transition">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <EmptyState icon={<Mail className="h-12 w-12 text-gray-400" />} title="No pending requests" description="When someone sends you a friend request, it will show up here." />
            )}
          </div>
        )}

        {/* Search */}
        {activeTab === "search" && (
          <div className="animate-fade-in-up">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search by name or username..."
                  className="h-12 flex-1 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <button onClick={handleSearch} className="h-12 rounded-xl bg-gray-900 px-6 text-sm font-bold text-white hover:bg-gray-800 transition">Search</button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Results</h3>
                <div className="space-y-3">
                  {searchResults.map((user: any) => (
                    <div key={user._id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                      <button onClick={() => handleSendRequest(user._id)} className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition">Add Friend</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity Feed */}
        {activeTab === "activity" && (
          <div className="animate-fade-in-up rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Friend Activity</h3>
            <div className="space-y-4">
              {friendActivity.length > 0 ? (
                friendActivity.map((activity: any) => (
                  <div key={activity._id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-lg">
                      {activity.type === "run_completed" ? <Footprints className="h-5 w-5 text-red-500" /> : activity.type === "territory_captured" ? <Flag className="h-5 w-5 text-blue-500" /> : activity.type === "achievement_unlocked" ? <Trophy className="h-5 w-5 text-yellow-500" /> : <Bell className="h-5 w-5 text-gray-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(activity.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState icon={<Activity className="h-12 w-12 text-gray-400" />} title="No recent activity from friends" description="Add friends to see their runs and achievements here." actionLabel="Find Friends" actionHref="#search" />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

