"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } from "@/lib/api/notifications";
import { useNotifications } from "@/lib/hooks/useSocket";
import { Bell, Users, Check, Flag, Trophy, Target, Star, TrendingUp, Medal, Award, Footprints, AlertCircle, Mail, X, MapPin } from "lucide-react";

const typeIcons: Record<string, React.ReactNode> = {
  friend_request: <Users className="h-5 w-5 text-blue-500" />,
  friend_accepted: <Check className="h-5 w-5 text-green-500" />,
  territory_captured: <Flag className="h-5 w-5 text-red-500" />,
  territory_lost: <MapPin className="h-5 w-5 text-red-500" />,
  challenge_completed: <Trophy className="h-5 w-5 text-yellow-500" />,
  challenge_received: <Target className="h-5 w-5 text-red-500" />,
  level_up: <Star className="h-5 w-5 text-yellow-500" />,
  leaderboard_promotion: <TrendingUp className="h-5 w-5 text-green-500" />,
  achievement_unlocked: <Medal className="h-5 w-5 text-purple-500" />,
  badge_earned: <Award className="h-5 w-5 text-yellow-500" />,
  run_completed: <Footprints className="h-5 w-5 text-red-500" />,
  system: <Bell className="h-5 w-5 text-gray-500" />,
};

export default function NotificationsPage() {
  const { notifications: socketNotifications, unreadCount, setUnreadCount, setNotifications } = useNotifications();
  const [notifications, setLocalNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notifRes, countRes] = await Promise.allSettled([
          getNotifications({ page: 1, limit: 50 }),
          getUnreadCount(),
        ]);
        if (notifRes.status === "fulfilled" && notifRes.value.success) {
          setLocalNotifications(notifRes.value.data);
          setNotifications(notifRes.value.data);
        }
        if (countRes.status === "fulfilled" && countRes.value.success) {
          setUnreadCount(countRes.value.data.count);
        }
      } catch (err) {
        console.error("Notifications fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [setNotifications, setUnreadCount]);

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id);
      setLocalNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setLocalNotifications((prev) => prev.filter((n) => n._id !== id));
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) { console.error(err); }
  };

  const displayNotifications = socketNotifications.length > 0 ? socketNotifications : notifications;
  const displayUnreadCount = unreadCount;

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950"><Bell className="inline-block h-8 w-8 text-red-500 mr-2" />Notifications</h1>
            <p className="mt-2 text-gray-600">Stay updated on your activity and friends.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-red-600 underline-offset-4 hover:underline">Back to dashboard</Link>
        </div>

        <div className="mb-4 flex items-center justify-between animate-fade-in-up">
          <p className="text-sm text-gray-500">
            {displayUnreadCount > 0 ? `${displayUnreadCount} unread` : "All caught up!"}
          </p>
          {displayUnreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="text-sm font-semibold text-red-600 hover:underline">
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-2 animate-fade-in-up">
          {isLoading ? (
            [1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton-shimmer h-20 rounded-xl" />)
          ) : displayNotifications.length > 0 ? (
            displayNotifications.map((notif: any) => (
              <div
                key={notif._id}
                className={`flex items-start gap-4 rounded-xl border p-4 transition hover:shadow-sm ${
                  notif.read ? "border-gray-100 bg-white" : "border-red-100 bg-red-50/50"
                }`}
                onClick={() => !notif.read && handleMarkRead(notif._id)}
              >
                <span className="text-2xl flex-shrink-0">{typeIcons[notif.type] || <Bell className="h-5 w-5 text-gray-400" />}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-sm ${notif.read ? "text-gray-900" : "font-bold text-gray-900"}`}>{notif.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!notif.read && <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />}
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }} className="text-gray-300 hover:text-red-500 transition text-sm flex-shrink-0"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400">
                <EmptyState icon={<Bell className="h-12 w-12 text-gray-400" />} title="No notifications yet" description="Activity alerts will appear here." actionLabel="Explore" actionHref="/territories" />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

