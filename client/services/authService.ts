import api from "./api";
import type { Pagination } from "@/types";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user: User;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const login = (payload: LoginPayload): Promise<AuthResponse> =>
  api.post("/auth/login", payload).then((r) => r.data);

export const logout = (): Promise<LogoutResponse> => api.post("/auth/logout").then((r) => r.data);

export const getProfile = (): Promise<AuthResponse> => api.get("/auth/profile").then((r) => r.data);

export const updateProfile = (payload: { name?: string; email?: string }): Promise<AuthResponse> =>
  api.patch("/auth/profile", payload).then((r) => r.data);

export const updatePassword = (payload: { currentPassword: string; newPassword: string }): Promise<LogoutResponse> =>
  api.patch("/auth/password", payload).then((r) => r.data);

export type { Pagination };
