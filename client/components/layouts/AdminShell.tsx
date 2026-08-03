"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminNavbar } from "./AdminNavbar";
import { FullScreenLoader } from "../ui/Spinner";
import { useAuth } from "@/features/auth/AuthProvider";
import type { ReactNode } from "react";

export default function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { loading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Sidebar/navbar are mounted even while the session loads — only the main
  // area waits, so the shell never unmounts during navigation.
  return (
    <div className="flex min-h-screen bg-navy bg-hero-radial">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminNavbar onOpenMobile={openMobile} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {loading || !isAuthenticated ? <FullScreenLoader label="Preparing your portal" /> : children}
        </main>
      </div>
    </div>
  );
}
