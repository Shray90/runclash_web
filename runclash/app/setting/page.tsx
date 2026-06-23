"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AuthUser } from "../lib/api/authApi";
import { useAuth } from "../providers/AuthProvider";

type ProfileState = {
  fullName: string;
  fitnessGoal: "loose" | "stay" | "gain";
  imageFile: File | null;
  imagePreviewUrl: string | null;
};

type PasswordState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function SettingPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [whoamiLoading, setWhoamiLoading] = useState(true);

  const [profile, setProfile] = useState<ProfileState>({
    fullName: "",
    fitnessGoal: "stay",
    imageFile: null,
    imagePreviewUrl: null,
  });

  const [password, setPassword] = useState<PasswordState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Prefill from context if present
        if (user) {
          if (!mounted) return;
          setProfile((p) => ({
            ...p,
            fullName: user.fullName ?? "",
            fitnessGoal: (user as any).fitnessGoal || "stay",
          }));
          return;
        }

        // Otherwise call whoami via proxy
        setWhoamiLoading(true);
        const res = await fetch("/api/v1/auth/whoami", { method: "GET", cache: "no-store" });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.success) {
          return;
        }

        const data = json.data as AuthUser & { fitnessGoal?: ProfileState["fitnessGoal"] };
        if (!mounted) return;

        setProfile((p) => ({
          ...p,
          fullName: data.fullName ?? "",
          fitnessGoal: data.fitnessGoal || "stay",
        }));
      } finally {
        if (mounted) setWhoamiLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  const canSubmit = useMemo(() => !authLoading && !whoamiLoading, [authLoading, whoamiLoading]);

  const onChangeProfile = (key: "fullName" | "fitnessGoal", value: string) => {
    setFieldErrors({});
    setProfile((cur) => ({ ...cur, [key]: value as any }));
  };

  const onSelectImage = (file: File | null) => {
    setFieldErrors({});

    if (!file) {
      setProfile((cur) => ({ ...cur, imageFile: null, imagePreviewUrl: null }));
      return;
    }

    const preview = URL.createObjectURL(file);
    setProfile((cur) => ({ ...cur, imageFile: file, imagePreviewUrl: preview }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmittingProfile(true);
    setMessage("");
    setFieldErrors({});

    try {
      const formData = new FormData();
      formData.set("fullName", profile.fullName);
      formData.set("fitnessGoal", profile.fitnessGoal);
      if (profile.imageFile) formData.set("image", profile.imageFile);

      const res = await fetch("/api/v1/auth/update", {
        method: "POST",
        body: formData,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.success) {
        setMessage(json?.message || "Update failed");
        return;
      }

      setMessage("Profile updated");
      await refreshUser();
    } catch {
      setMessage("Update failed");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmittingPassword(true);
    setMessage("");
    setFieldErrors({});

    try {
      if (password.newPassword !== password.confirmPassword) {
        setMessage("New password and confirm password do not match");
        return;
      }

      const formData = new FormData();
      formData.set("currentPassword", password.currentPassword);
      formData.set("newPassword", password.newPassword);
      formData.set("confirmPassword", password.confirmPassword);

      const res = await fetch("/api/v1/auth/update", {
        method: "POST",
        body: formData,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.success) {
        setMessage(json?.message || "Password update failed");
        return;
      }

      setMessage("Password updated successfully");
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      await refreshUser();
    } catch {
      setMessage("Password update failed");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">User Settings</h1>
            <p className="mt-1 text-gray-600">Update profile and password</p>
          </div>

          <Link href="/dashboard" className="text-sm font-semibold text-sky-600 underline">
            Back to dashboard
          </Link>
        </div>

        {message ? (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
            {message}
          </div>
        ) : null}

        {/* Profile Update */}
        <section className="mt-8 rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-950">Profile update</h2>

          <form onSubmit={handleUpdateProfile} className="mt-5 space-y-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Full name</label>
                <input
                  className="w-full rounded-xl bg-gray-50 px-4 py-3 outline-none ring-1 ring-gray-200 focus:ring-[#B3261E]"
                  value={profile.fullName}
                  onChange={(e) => onChangeProfile("fullName", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Fitness goal</label>
                <select
                  className="w-full rounded-xl bg-gray-50 px-4 py-3 outline-none ring-1 ring-gray-200 focus:ring-[#B3261E]"
                  value={profile.fitnessGoal}
                  onChange={(e) => onChangeProfile("fitnessGoal", e.target.value)}
                >
                  <option value="loose">Loose</option>
                  <option value="stay">Stay</option>
                  <option value="gain">Gain</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Profile image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onSelectImage(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-700"
              />

              {profile.imagePreviewUrl ? (
                <img
                  src={profile.imagePreviewUrl}
                  alt="preview"
                  className="mt-3 h-24 w-24 rounded-full object-cover"
                />
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSubmittingProfile || !canSubmit}
              className="rounded-full bg-[#B3261E] px-6 py-3 text-white font-bold disabled:opacity-60"
            >
              {isSubmittingProfile ? "Updating..." : "Update profile"}
            </button>
          </form>
        </section>

        {/* Password Update */}
        <section className="mt-8 rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-950">Password update</h2>

          <form onSubmit={handleUpdatePassword} className="mt-5 space-y-5" noValidate>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Current password</label>
              <input
                type="password"
                value={password.currentPassword}
                onChange={(e) => setPassword((p) => ({ ...p, currentPassword: e.target.value }))}
                className="w-full rounded-xl bg-gray-50 px-4 py-3 outline-none ring-1 ring-gray-200 focus:ring-[#B3261E]"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">New password</label>
                <input
                  type="password"
                  value={password.newPassword}
                  onChange={(e) => setPassword((p) => ({ ...p, newPassword: e.target.value }))}
                  className="w-full rounded-xl bg-gray-50 px-4 py-3 outline-none ring-1 ring-gray-200 focus:ring-[#B3261E]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Confirm new password</label>
                <input
                  type="password"
                  value={password.confirmPassword}
                  onChange={(e) => setPassword((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className="w-full rounded-xl bg-gray-50 px-4 py-3 outline-none ring-1 ring-gray-200 focus:ring-[#B3261E]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingPassword || !canSubmit}
              className="rounded-full bg-[#B3261E] px-6 py-3 text-white font-bold disabled:opacity-60"
            >
              {isSubmittingPassword ? "Updating..." : "Update password"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

