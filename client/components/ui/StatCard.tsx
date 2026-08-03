"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import Card from "./Card";

export type StatAccent = "gold" | "green" | "red" | "blue" | "white";

const ACCENTS: Record<StatAccent, string> = {
  gold: "text-gold bg-gold/15",
  green: "text-green-400 bg-success/15",
  red: "text-red-400 bg-danger/15",
  blue: "text-blue-300 bg-blue-500/15",
  white: "text-white/80 bg-white/10",
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  accent?: StatAccent;
  delay?: number;
}

export default function StatCard({ icon: Icon, label, value, sub, accent = "gold", delay = 0 }: StatCardProps) {
  return (
    <Card hover delay={delay} className="relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.15, type: "spring", stiffness: 260, damping: 18 }}
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${ACCENTS[accent]}`}
      >
        <Icon size={20} />
      </motion.div>
      <div className="flex items-end justify-between">
        <div>
          <p className="font-display text-2xl font-bold text-white">{value}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-white/45">{label}</p>
        </div>
        {sub && <p className="text-xs font-semibold text-gold/80">{sub}</p>}
      </div>
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold/[0.07] blur-2xl" />
    </Card>
  );
}
