"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  onClick?: () => void;
}

export default function Card({ children, className = "", hover = false, delay = 0, onClick }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
      onClick={onClick}
      className={`glass rounded-2xl p-5 ${hover ? "transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-glow" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}
