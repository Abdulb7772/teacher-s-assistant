import api from "./api";
import type { User } from "@/types";

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const getUsers = (): Promise<User[]> => api.get("/users").then((r) => r.data.data);

export const createUser = (payload: CreateUserPayload): Promise<User> =>
  api.post("/users", payload).then((r) => r.data.user);

export interface UpdateUserPayload {
  name: string;
  email: string;
  password?: string;
}

export const updateUser = (id: string, payload: UpdateUserPayload): Promise<User> =>
  api.put(`/users/${id}`, payload).then((r) => r.data.user);

export const deleteUser = (id: string): Promise<void> =>
  api.delete(`/users/${id}`).then(() => undefined);
