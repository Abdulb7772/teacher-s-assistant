import type { ReactNode } from "react";

export type BadgeVariant = "gold" | "success" | "danger" | "neutral" | "blue";

const STYLES: Record<BadgeVariant, string> = {
  gold: "bg-gold/15 text-gold border border-gold/30",
  success: "bg-success/15 text-green-400 border border-success/30",
  danger: "bg-danger/15 text-red-400 border border-danger/30",
  neutral: "bg-white/8 text-white/60 border border-white/15",
  blue: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
};

export default function Badge({
  variant = "neutral",
  children,
  className = "",
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STYLES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
