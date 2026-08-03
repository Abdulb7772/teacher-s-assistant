"use client";

import { Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon = Inbox, title = "Nothing here yet", description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 text-gold">
        <Icon size={30} />
      </span>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-white/45">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
