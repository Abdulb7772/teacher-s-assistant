"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, ShieldCheck, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as publicService from "@/services/publicService";
import Button from "@/components/ui/Button";

const FADE_UP = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6 },
} as const;

const ABOUT_POINTS = [
  "Plan a full semester of lectures in minutes",
  "Track quizzes and grades without spreadsheets",
  "Export polished reports with one click",
];

export default function LandingPage() {
  const { data: counts } = useQuery({
    queryKey: ["public-counts"],
    queryFn: async () => {
      const [outline, students] = await Promise.all([
        publicService.getPublicCourseOutline({ page: 1, limit: 1 }),
        publicService.getPublicStudents({ page: 1, limit: 1 }),
      ]);
      return {
        topics: outline.pagination.total,
        students: students.pagination.total,
      };
    },
  });

  const liveStats: { icon: LucideIcon; label: string; value?: string | number }[] = [
    { icon: BookOpen, label: "Total Topics", value: counts?.topics },
    { icon: Users, label: "Registered Students", value: counts?.students },
    { icon: ShieldCheck, label: "Security", value: "JWT Secure" },
  ];

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-20 pb-24 text-center"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-gold"
          >
            <Sparkles size={13} /> The complete course management workspace
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-6 max-w-4xl font-display text-5xl font-bold leading-[1.1] text-white lg:text-6xl"
          >
            Teach smarter with <span className="text-gradient-gold">Teacher Assistant</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/55"
          >
            Plan your semester outline, track quiz performance, compute grades and export polished reports — all
            in one secure workspace designed for teachers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/course-outline">
              <Button size="lg" variant="secondary">
                Browse Course Outline
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <motion.section {...FADE_UP} className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {liveStats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-5 text-center">
                <s.icon size={20} className="mx-auto text-gold" />
                <p className="mt-3 font-display text-2xl font-bold text-gold">{s.value ?? "—"}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-white/45">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section {...FADE_UP} className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold text-white lg:text-4xl">
            Everything a teacher needs, <span className="text-gradient-gold">in one place</span>
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-white/55">
            Stop juggling spreadsheets and scattered notes. Teacher Assistant brings your entire workflow into
            one place — from planning lectures month by month to recording student marks and generating reports.
          </p>
          <ul className="mt-6 space-y-3">
            {ABOUT_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm text-white/70">
                <CheckCircle2 size={18} className="shrink-0 text-gold" /> {point}
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

    </>
  );
}
