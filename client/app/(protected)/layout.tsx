import AdminLayout from "@/components/layouts/AdminLayout";
import type { ReactNode } from "react";

export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
