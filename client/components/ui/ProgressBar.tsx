"use client";

import { motion } from "framer-motion";

export type ProgressColor = "gold" | "green" | "red" | "blue";

const COLORS: Record<ProgressColor, string> = {
  gold: "bg-gold-gradient",
  green: "bg-success",
  red: "bg-danger",
  blue: "bg-blue-500",
};

export default function ProgressBar({
  value = 0,
  className = "",
  color = "gold",
}: {
  value?: number;
  className?: string;
  color?: ProgressColor;
}) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-white/10 ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${COLORS[color]}`}
      />
    </div>
  );
}
