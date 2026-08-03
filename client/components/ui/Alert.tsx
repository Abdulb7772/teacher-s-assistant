import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type AlertVariant = "success" | "info" | "warning" | "error";

const STYLES: Record<AlertVariant, string> = {
  success: "border-success/40 bg-success/10 text-green-300",
  info: "border-gold/40 bg-gold/10 text-gold-light",
  warning: "border-accent/40 bg-accent/10 text-yellow-200",
  error: "border-danger/40 bg-danger/10 text-red-300",
};

const ICONS: Record<AlertVariant, LucideIcon> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

export default function Alert({
  variant = "info",
  children,
  className = "",
}: {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}) {
  const Icon = ICONS[variant];
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${STYLES[variant]} ${className}`}>
      <Icon size={17} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
