import AdminShell from "@/components/layouts/AdminShell";
import type { ReactNode } from "react";

// Persistent layout: mounts once, survives every client-side navigation.
// Only the page below swaps — sidebar and navbar stay mounted (memoized).
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
