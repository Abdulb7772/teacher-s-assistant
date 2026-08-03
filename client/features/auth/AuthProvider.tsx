"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as authService from "@/services/authService";
import { setUnauthorizedHandler } from "@/services/api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signin: (payload: authService.LoginPayload) => Promise<User>;
  logout: (silent?: boolean) => void;
  updateProfile: (payload: { name?: string; email?: string }) => Promise<User>;
  changePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const SESSION_KEY = ["session"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Session is fetched ONCE per page load and cached in the query store.
  // It only refreshes on login, logout, profile update or explicit invalidation.
  const { data, isPending } = useQuery({
    queryKey: SESSION_KEY,
    queryFn: authService.getProfile,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const user = data?.user ?? null;

  // Non-remembered sessions die on every full page load: the provider remounts
  // only on reload (SPA navigation keeps it mounted), so this effect runs exactly
  // once per page load. Awaiting the logout guarantees the cookie is gone before
  // navigating, so the middleware can't bounce us back into a redirect loop.
  useEffect(() => {
    if (data && data.remembered === false) {
      authService
        .logout()
        .catch(() => {})
        .finally(() => {
          queryClient.clear();
          router.replace("/login");
        });
    }
  }, [data, queryClient, router]);

  // 401 on any API call => session expired: clear cache + send to login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.clear();
      toast.error("Session expired, please sign in again");
      router.replace("/login");
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient, router]);

  const signin = useCallback(
    async (payload: authService.LoginPayload): Promise<User> => {
      const res = await authService.login(payload);
      queryClient.setQueryData(SESSION_KEY, res);
      return res.user;
    },
    [queryClient]
  );

  const logout = useCallback(
    (silent = false): void => {
      authService.logout().catch(() => {});
      queryClient.clear();
      if (!silent) toast("Signed out", { icon: "👋" });
      router.replace("/login");
    },
    [queryClient, router]
  );

  const updateProfile = useCallback(
    async (payload: { name?: string; email?: string }): Promise<User> => {
      const res = await authService.updateProfile(payload);
      queryClient.setQueryData(SESSION_KEY, (prev: authService.AuthResponse | undefined) =>
        prev ? { ...prev, user: res.user } : prev
      );
      return res.user;
    },
    [queryClient]
  );

  const changePassword = useCallback(
    async (payload: { currentPassword: string; newPassword: string }) => {
      await authService.updatePassword(payload);
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading: isPending,
      isAuthenticated: Boolean(user),
      signin,
      logout,
      updateProfile,
      changePassword,
    }),
    [user, isPending, signin, logout, updateProfile, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
