"use client";

import { motion } from "framer-motion";

export default function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3"
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <motion.span
        animate={{ backgroundColor: checked ? "#D4AF37" : "rgba(255,255,255,0.15)" }}
        className="flex h-6 w-11 items-center rounded-full p-0.5"
      >
        <motion.span
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="h-5 w-5 rounded-full bg-white shadow"
        />
      </motion.span>
    </button>
  );
}
