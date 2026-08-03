import axios, { AxiosError } from "axios";

export interface ApiErrorPayload {
  status?: number;
  message?: string;
  errors?: { field: string; message: string }[];
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
  timeout: 20000,
});

let onUnauthorized: (() => void) | null = null;
let accessToken: string | null = null;

export const setUnauthorizedHandler = (fn: () => void): void => {
  onUnauthorized = fn;
};

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ success: boolean; message: string; errors?: { field: string; message: string }[] }>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || "Something went wrong";

    if (status === 401 && !error.config?.url?.includes("/auth/")) {
      if (onUnauthorized) onUnauthorized();
    }

    return Promise.reject({ status, message, errors: error.response?.data?.errors } satisfies ApiErrorPayload);
  }
);

export default api;
