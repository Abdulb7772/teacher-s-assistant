"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Logo from "../ui/Logo";
import { useAuth } from "@/features/auth/AuthProvider";
import { FullScreenLoader } from "../ui/Spinner";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) router.replace("/dashboard");
  }, [loading, isAuthenticated, router]);

  if (loading) return <FullScreenLoader label="Loading" />;

  return (
    <div className="flex min-h-screen bg-navy">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative hidden w-1/2 overflow-hidden bg-navy-gradient lg:flex lg:flex-col lg:justify-between lg:p-12"
      >
        <div className="pointer-events-none absolute inset-0 bg-hero-radial" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative z-10">
          <Logo />
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl font-bold leading-tight text-white">
            Manage your course,
            <span className="text-gradient-gold"> effortlessly.</span>
          </h1>
          <p className="mt-4 leading-relaxed text-white/55">
            Plan topics, track completion, record quiz marks, compute grades and export everything — all in one
            premium portal built for teachers.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { value: "24", label: "Topics" },
              { value: "8", label: "Students" },
              { value: "1", label: "Workspace" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-4 text-center">
                <p className="font-display text-2xl font-bold text-gold">{s.value}+</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/45">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/30">
          © {new Date().getFullYear()} Teacher Assistant · Course Management Portal
        </p>
      </motion.div>

      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
