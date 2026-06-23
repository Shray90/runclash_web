"use server";

import { AuthApiError, type AuthUser } from "../lib/api/authApi";

type ActionResult<T> =
  | { ok: true; message: string; data: T }
  | { ok: false; message: string; fieldErrors: Record<string, string> };

const getTokenFromCookie = () => {
  // Server actions can’t read document.cookie; keep client-side usage for now.
  return null;
};

export async function noop() {
  return null;
}

export type { ActionResult, AuthUser, AuthApiError };

