"use client";

import { createContext, useCallback, useContext, useEffect, type ReactNode } from "react";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import toast from "react-hot-toast";
import * as authService from "@/services/authService";
import { setAccessToken, setUnauthorizedHandler } from "@/services/api";
import type { LoginPayload } from "@/services/authService";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signin: (payload: LoginPayload) => Promise<User>;
  logout: (silent?: boolean) => void;
  updateProfile: (payload: { name?: string; email?: string }) => Promise<User>;
  changePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const toUser = (session: Session | null): User | null => {
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    createdAt: "",
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();

  useEffect(() => {
    setAccessToken(session?.accessToken ?? null);
  }, [session]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (!window.location.pathname.startsWith("/login")) {
        toast.error("Session expired, please sign in again");
        signOut({ redirect: false });
        window.location.href = "/login";
      }
    });
  }, []);

  const signin = useCallback(async (payload: LoginPayload): Promise<User> => {
    const res = await signIn("credentials", { redirect: false, ...payload });
    if (!res?.ok) throw new Error(res?.error === "CredentialsSignin" ? "Invalid email or password" : "Sign in failed");
    const fresh = await getSession();
    return toUser(fresh) as User;
  }, []);

  const logout = useCallback((silent = false): void => {
    signOut({ redirect: false });
    authService.logout().catch(() => {});
    if (!silent) {
      toast("Signed out", { icon: "👋" });
      window.location.href = "/login";
    }
  }, []);

  const updateProfile = useCallback(
    async (payload: { name?: string; email?: string }): Promise<User> => {
      const res = await authService.updateProfile(payload);
      await update({ name: res.user.name, email: res.user.email });
      return res.user;
    },
    [update]
  );

  const changePassword = useCallback(async (payload: { currentPassword: string; newPassword: string }) => {
    await authService.updatePassword(payload);
  }, []);

  const value: AuthContextValue = {
    user: toUser(session),
    loading: status === "loading" && !session,
    isAuthenticated: Boolean(session?.user),
    signin,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
