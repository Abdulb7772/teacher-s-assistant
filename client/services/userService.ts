import api from "./api";
import type { User } from "@/lib/types";

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const getUsers = (): Promise<User[]> => api.get("/users").then((r) => r.data.data);

export const createUser = (payload: CreateUserPayload): Promise<User> =>
  api.post("/users", payload).then((r) => r.data.user);
