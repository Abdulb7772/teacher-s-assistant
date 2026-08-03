"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import type { ReactNode } from "react";

// ponytail: single module-scoped client so the cache survives route changes.
// Defaults tuned for a session app: data is only refetched on explicit
// invalidation (mutations), never on window focus / reconnect / remount.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      placeholderData: (prev: unknown) => prev,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#102C57",
            color: "#E5E7EB",
            border: "1px solid rgba(212,175,55,0.35)",
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#22C55E", secondary: "#fff" } },
          error: { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
        }}
      />
    </QueryClientProvider>
  );
}
