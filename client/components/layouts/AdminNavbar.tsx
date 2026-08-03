"use client";

import { memo } from "react";
import { Menu } from "lucide-react";
import Avatar from "../ui/Avatar";
import { useAuth } from "@/features/auth/AuthProvider";

// Header bar: memoized, no usePathname/useRouter — renders once per session.
export const AdminNavbar = memo(function AdminNavbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-navy/70 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={onOpenMobile}
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
  );
});
