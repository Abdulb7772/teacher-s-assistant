"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ClipboardList,
  LayoutDashboard,
  Library,
  LogOut,
  Settings,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Logo from "../ui/Logo";
import Avatar from "../ui/Avatar";
import { useAuth } from "@/features/auth/AuthProvider";

const NAV_ITEMS: { to: string; label: string; icon: LucideIcon; end?: boolean; adminOnly?: boolean }[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/outline", label: "Course Outline", icon: BookOpen },
  { to: "/students/manage", label: "Students", icon: Users },
  { to: "/quizzes", label: "Quiz Marks", icon: ClipboardList },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/users", label: "Manage Users", icon: UserPlus, adminOnly: true },
  { to: "/subjects", label: "Subjects & Classes", icon: Library, adminOnly: true },
  { to: "/settings", label: "Settings", icon: Settings },
];

// Subscribes to usePathname itself, so only the active link re-renders on
// navigation — the sidebar shell never does.
function NavLink({ item, collapsed }: { item: (typeof NAV_ITEMS)[number]; collapsed: boolean }) {
  const pathname = usePathname();
  const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
  return (
    <Link
      href={item.to}
      prefetch
      className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 ${
        active ? "bg-gold-gradient text-navy shadow-glow" : "text-white/60 hover:bg-white/10 hover:text-white"
      } ${collapsed ? "justify-center" : ""}`}
      title={collapsed ? item.label : undefined}
    >
      <item.icon size={18} className="shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export const AdminSidebar = memo(function AdminSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { user, logout } = useAuth();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "admin");

  const content = (
    <div className="flex h-full flex-col">
      <div className={`flex items-center px-4 py-5 ${collapsed ? "justify-center px-2" : "justify-between"}`}>
        <Logo compact={collapsed} />
        <button
          onClick={onToggle}
          className="hidden rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white lg:block"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft size={18} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => (
          <NavLink key={item.to} item={item} collapsed={collapsed} />
        ))}
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
          onClick={() => logout()}
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
    <>
      <aside
        className={`hidden shrink-0 border-r border-white/10 bg-navy-deep/60 backdrop-blur-xl transition-all duration-300 lg:block ${
          collapsed ? "w-[76px]" : "w-[248px]"
        }`}
      >
        <div className="sticky top-0 h-screen">{content}</div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy/70 backdrop-blur-sm lg:hidden"
            onClick={onCloseMobile}
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
                  onClick={onCloseMobile}
                  className="rounded-lg p-1.5 text-white/50 hover:text-white"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>
              {content}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
