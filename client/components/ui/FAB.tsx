"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export default function FAB({
  icon: Icon,
  label,
  onClick,
  shortcut,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  shortcut?: string;
}) {
  return (
    <motion.button
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.4 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className="group fixed bottom-6 right-6 z-40 flex h-14 items-center gap-2 rounded-full bg-gold-gradient px-4 font-semibold text-navy shadow-glow transition-shadow hover:shadow-glow"
      aria-label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      <Icon size={22} />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:max-w-[140px] sm:block">
        {label}
      </span>
    </motion.button>
  );
}
