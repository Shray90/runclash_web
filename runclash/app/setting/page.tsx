"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { updateProfile, updatePassword, deleteAccount, updateSettings } from "@/lib/api/auth";
import { handleLogout } from "@/lib/actions/auth-action";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "privacy" | "notifications">("profile");

  // Profile form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Settings save messages
  const [settingsMessage, setSettingsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Privacy toggles
  const [showProfile, setShowProfile] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [showLocation, setShowLocation] = useState(false);

  // Notification prefs
  const [notifFriendRequests, setNotifFriendRequests] = useState(true);
  const [notifTerritory, setNotifTerritory] = useState(true);
  const [notifChallenges, setNotifChallenges] = useState(true);
  const [notifAchievements, setNotifAchievements] = useState(true);
  const [notifLeaderboard, setNotifLeaderboard] = useState(true);
  const [notifRuns, setNotifRuns] = useState(true);
  const [notifMessage, setNotifMessage] = useState<{ type: "success"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setUsername(user.username || "");
      setBio(user.bio || "");
      setShowProfile(user.settings?.privacy?.showProfile ?? true);
      setShowStats(user.settings?.privacy?.showStats ?? true);
      setShowLocation(user.settings?.privacy?.showLocation ?? false);
      setNotifFriendRequests(user.settings?.notificationPreferences?.friendRequests ?? true);
      setNotifTerritory(user.settings?.notificationPreferences?.territoryUpdates ?? true);
      setNotifChallenges(user.settings?.notificationPreferences?.challenges ?? true);
      setNotifAchievements(user.settings?.notificationPreferences?.achievements ?? true);
      setNotifLeaderboard(user.settings?.notificationPreferences?.leaderboard ?? true);
      setNotifRuns(user.settings?.notificationPreferences?.runs ?? true);
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !username) {
      setProfileMessage({ type: "error", text: "Name and username are required" });
      return;
    }
    setIsUpdating(true);
    setProfileMessage(null);
    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("username", username);
      if (bio) formData.append("bio", bio);
      if (profileImage) formData.append("profileImage", profileImage);

      const res = await updateProfile(formData);
      if (res.success) {
        setProfileMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setProfileMessage({ type: "error", text: res.message || "Update failed" });
      }
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message || "Update failed" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    setIsChangingPassword(true);
    setPasswordMessage(null);
    try {
      const res = await updatePassword({ currentPassword, newPassword, confirmPassword });
      if (res.success) {
        setPasswordMessage({ type: "success", text: "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage({ type: "error", text: res.message || "Password change failed" });
      }
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Password change failed" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    try {
      await deleteAccount();
      await logout();
    } catch (err: any) {
      alert(err.message || "Failed to delete account");
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSettingsMessage(null);
    try {
      const res = await updateSettings({
        darkMode: (user as any)?.settings?.darkMode ?? false,
        locationPermissions: showLocation,
        notificationPreferences: {
          friendRequests: notifFriendRequests,
          territoryUpdates: notifTerritory,
          challenges: notifChallenges,
          achievements: notifAchievements,
          leaderboard: notifLeaderboard,
          runs: notifRuns,
        },
        privacy: {
          showProfile,
          showStats,
          showLocation,
        },
      });
      if (res.success) {
        setSettingsMessage({ type: "success", text: "Settings saved successfully!" });
      } else {
        setSettingsMessage({ type: "error", text: res.message || "Save failed" });
      }
    } catch (err: any) {
      setSettingsMessage({ type: "error", text: err.message || "Save failed" });
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">Settings & Profile</h1>
            <p className="mt-2 text-gray-600">Manage your profile, security, and preferences.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-red-600 underline-offset-4 hover:underline">
            Back to dashboard
          </Link>
        </div>

        {/* Profile Card */}
        <div className="mb-8 animate-fade-in-up rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center font-bold text-white text-2xl shadow-md overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  `${user?.firstName?.[0] || "R"}${user?.lastName?.[0] || "C"}`
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white text-xs hover:bg-red-700 transition shadow">
                📷
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-gray-500">@{user?.username}</p>
              <p className="text-xs text-gray-400 mt-1">
                Level {user?.level || 1} • {user?.xp || 0} XP
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 animate-fade-in-up flex-wrap">
          {[
            { key: "profile", label: "Profile" },
            { key: "password", label: "Password" },
            { key: "privacy", label: "Privacy" },
            { key: "notifications", label: "Notifications" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                activeTab === tab.key
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="animate-fade-in-up rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Edit Profile</h2>

            {profileMessage && (
              <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${
                profileMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="h-11 rounded-xl bg-gray-900 px-6 text-sm font-bold text-white hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-red-600 mb-2">Danger Zone</h3>
              <p className="text-sm text-gray-500 mb-3">Permanently delete your account and all data.</p>
              <button
                onClick={handleDeleteAccount}
                className="rounded-xl border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 transition"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="animate-fade-in-up rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Change Password</h2>

            {passwordMessage && (
              <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${
                passwordMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {passwordMessage.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="h-11 rounded-xl bg-gray-900 px-6 text-sm font-bold text-white hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === "privacy" && (
          <div className="animate-fade-in-up rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Privacy Settings</h2>
            {settingsMessage && (
              <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${
                settingsMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {settingsMessage.text}
              </div>
            )}
            <div className="space-y-4">
              {[
                { key: "showProfile", label: "Show Profile", desc: "Display your profile to other users", value: showProfile, set: setShowProfile },
                { key: "showStats", label: "Show Stats", desc: "Display your running statistics", value: showStats, set: setShowStats },
                { key: "showLocation", label: "Show Location", desc: "Show your current location on the map", value: showLocation, set: setShowLocation },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                  <div>
                    <p className="font-semibold text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => item.set(!item.value)}
                    className={`relative h-7 w-12 rounded-full transition ${
                      item.value ? "bg-red-600" : "bg-gray-300"
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                      item.value ? "translate-x-5" : ""
                    }`} />
                  </button>
                </div>
              ))}
             </div>
            <div className="mt-6 flex justify-end">
              <button onClick={handleSaveSettings} disabled={isSavingSettings} className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition disabled:opacity-50">
                {isSavingSettings ? "Saving..." : "Save Privacy Settings"}
              </button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="animate-fade-in-up rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { key: "friendRequests", label: "Friend Requests", desc: "When someone sends you a friend request", value: notifFriendRequests, set: setNotifFriendRequests },
                { key: "territoryUpdates", label: "Territory Updates", desc: "When a territory is captured or lost", value: notifTerritory, set: setNotifTerritory },
                { key: "challenges", label: "Challenges", desc: "When a challenge is completed or received", value: notifChallenges, set: setNotifChallenges },
                { key: "achievements", label: "Achievements", desc: "When you unlock a new achievement", value: notifAchievements, set: setNotifAchievements },
                { key: "leaderboard", label: "Leaderboard", desc: "When your ranking changes", value: notifLeaderboard, set: setNotifLeaderboard },
                { key: "runs", label: "Runs", desc: "When you complete a run", value: notifRuns, set: setNotifRuns },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                  <div>
                    <p className="font-semibold text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => item.set(!item.value)}
                    className={`relative h-7 w-12 rounded-full transition ${
                      item.value ? "bg-red-600" : "bg-gray-300"
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                      item.value ? "translate-x-5" : ""
                    }`} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={handleSaveSettings} disabled={isSavingSettings} className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition disabled:opacity-50">
                {isSavingSettings ? "Saving..." : "Save Notification Settings"}
              </button>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="mt-6 animate-fade-in-up">
          <form action={handleLogout}>
            <button type="submit" className="w-full rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm font-bold text-red-700 hover:bg-red-100 transition">
              Logout
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

