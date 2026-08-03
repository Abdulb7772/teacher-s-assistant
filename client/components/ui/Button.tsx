"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const VARIANTS: Record<string, string> = {
  primary: "btn-gold text-white hover:brightness-110",
  secondary: "glass text-white hover:border-gold/50 hover:bg-gold/10",
  outline: "border border-gold/60 text-gold hover:bg-gold/10",
  danger: "bg-danger/15 text-red-300 border border-danger/40 hover:bg-danger/25",
  ghost: "text-white/70 hover:bg-white/10 hover:text-white",
};

const SIZES: Record<string, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-5 text-sm gap-2",
  lg: "h-12 px-7 text-base gap-2.5",
};

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
  icon?: LucideIcon;
  children?: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </motion.button>
  );
}
