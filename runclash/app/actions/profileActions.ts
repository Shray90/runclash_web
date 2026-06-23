"use client";

import type { AuthUser } from "../lib/api/authApi";
import { getSavedUser, clearAuthSession } from "../lib/cookies/authCookies";
import { saveAuthSession } from "../lib/cookies/authCookies";

export async function loginAndSetContextUser() {
  // Placeholder: context is updated in Login page already.
  // Kept intentionally empty for Sprint 3.
  return true;
}

export type UpdateProfilePayload = {
  fullName?: string;
  fitnessGoal?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  image?: File | null;
};

export async function updateProfileWithImage(
  token: string,
  payload: UpdateProfilePayload
): Promise<{ ok: true; data: AuthUser } | { ok: false; message: string }> {
  const formData = new FormData();

  if (payload.fullName !== undefined) formData.set("fullName", payload.fullName);
  if (payload.fitnessGoal !== undefined)
    formData.set("fitnessGoal", payload.fitnessGoal);

  if (payload.image) {
    formData.set("image", payload.image);
  }

  if (payload.currentPassword) formData.set("currentPassword", payload.currentPassword);
  if (payload.newPassword) formData.set("newPassword", payload.newPassword);
  if (payload.confirmPassword) formData.set("confirmPassword", payload.confirmPassword);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // NOTE: this file is client-side; proxy should be used instead.
  // The page will call /api/v1/auth/update to ensure auth forwarding.
  const res = await fetch("/api/v1/auth/update", {
    method: "POST",
    headers: {
      // Authorization is handled by proxy from cookie.
      // Keep header unset.
    },
    body: formData,
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || !json?.success) {
    return { ok: false, message: json?.message || "Update failed" };
  }

  return { ok: true, data: json.data as AuthUser };
}

export async function whoamiViaProxy(): Promise<
  | { ok: true; data: AuthUser }
  | { ok: false; message: string }
> {
  const res = await fetch("/api/v1/auth/whoami", {
    method: "GET",
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || !json?.success) {
    return { ok: false, message: json?.message || "Unauthorized" };
  }

  return { ok: true, data: json.data as AuthUser };
}

export function logout() {
  clearAuthSession();
}

export function setSessionFromLogin(token: string, user: AuthUser, remember: boolean) {
  saveAuthSession(token, user, remember);
  return true;
}
