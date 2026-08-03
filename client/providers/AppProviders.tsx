"use client";

import QueryProvider from "./QueryProvider";
import { AuthProvider } from "@/features/auth/AuthProvider";
import type { ReactNode } from "react";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
