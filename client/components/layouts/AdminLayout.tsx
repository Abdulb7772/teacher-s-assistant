"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3, BookOpen, ChevronLeft, ClipboardList, LayoutDashboard, Library, LogOut, Menu, Settings, UserPlus, Users, X,
} from "lucide-react";
import Logo from "../ui/Logo";
import Avatar from "../ui/Avatar";
import { FullScreenLoader } from "../ui/Spinner";
import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/outline", label: "Course Outline", icon: BookOpen },
  { to: "/students/manage", label: "Students", icon: Users },
  { to: "/quizzes", label: "Quiz Marks", icon: ClipboardList },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/users", label: "Manage Users", icon: UserPlus, adminOnly: true },
  { to: "/subjects", label: "Subjects & Classes", icon: Library, adminOnly: true },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  // Warm up every portal route once authenticated so sidebar navigation is instant.
  useEffect(() => {
    if (!isAuthenticated) return;
    NAV_ITEMS.forEach((item) => router.prefetch(item.to));
  }, [isAuthenticated, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading || !isAuthenticated) return <FullScreenLoader label="Preparing your portal" />;

  const handleLogout = (): void => {
    logout();
    router.replace("/login");
  };

  const prefetchRoute = (to: string): void => {
    router.prefetch(to);
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className={`flex items-center px-4 py-5 ${collapsed ? "justify-center px-2" : "justify-between"}`}>
        <Logo compact={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white lg:block"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft size={18} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "admin").map((item) => {
          const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              href={item.to}
              prefetch
              onMouseEnter={() => prefetchRoute(item.to)}
              onFocus={() => prefetchRoute(item.to)}
              className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 ${
                active ? "bg-gold-gradient text-navy shadow-glow" : "text-white/60 hover:bg-white/10 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/10 p-3">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <Avatar name={user?.name} size="sm" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
              <p className="truncate text-[10px] uppercase tracking-widest text-gold/60">{user?.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-300/80 transition-colors hover:bg-danger/15 hover:text-red-300 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-navy bg-hero-radial">
      <aside
        className={`hidden shrink-0 border-r border-white/10 bg-navy-deep/60 backdrop-blur-xl transition-all duration-300 lg:block ${
          collapsed ? "w-[76px]" : "w-[248px]"
        }`}
      >
        <div className="sticky top-0 h-screen">{SidebarContent}</div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy/70 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="h-full w-[264px] bg-navy-deep"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-4">
                <Logo />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-1.5 text-white/50 hover:text-white"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>
              {SidebarContent}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-navy/70 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="hidden text-sm text-white/45 lg:block">Teacher Assistant · Admin Workspace</div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <Avatar name={user?.name} size="sm" />
              <span className="hidden text-sm font-medium text-white/80 sm:block">{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
