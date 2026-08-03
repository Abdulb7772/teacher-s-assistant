"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import Logo from "../ui/Logo";
import { useAuth } from "@/features/auth/AuthProvider";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/course-outline", label: "Course Outline" },
  { to: "/students", label: "Student Marks" },
];

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong shadow-soft" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                pathname === link.to ? "text-gold" : "text-white/65 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="btn-gold hidden items-center gap-2 rounded-xl px-4 py-2 text-sm md:inline-flex"
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          ) : (
            <div className="hidden items-center gap-2.5 md:flex">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:border-gold/50 hover:text-gold"
              >
                <LogIn size={15} /> Login
              </Link>
            </div>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-white/70 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-strong overflow-hidden md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {LINKS.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-4 py-2.5 text-sm font-medium ${
                    pathname === link.to ? "bg-gold/10 text-gold" : "text-white/70"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-3 border-t border-white/10 pt-4">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="btn-gold flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-xl border border-white/15 px-4 py-2.5 text-center text-sm text-white/70"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
