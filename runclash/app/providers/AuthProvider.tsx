"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { AuthUser } from "../lib/api/authApi";
import { getSavedUser } from "../lib/cookies/authCookies";
import { clearAuthSession, saveAuthSession } from "../lib/cookies/authCookies";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
  setUserFromLogin: (token: string, user: AuthUser, remember: boolean) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/auth/whoami", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const json = (await res.json()) as {
        success: boolean;
        data: AuthUser;
      };

      if (json?.success && json.data) {
        setUser(json.data);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = getSavedUser();
    setUser(saved);
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
  }, []);

  const setUserFromLogin = useCallback(
    (token: string, user: AuthUser, remember: boolean) => {
      saveAuthSession(token, user, remember);
      setUser(user);
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      refreshUser,
      logout,
      setUserFromLogin,
    }),
    [loading, logout, refreshUser, setUserFromLogin, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

