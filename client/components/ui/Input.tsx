"use client";

import { AlertCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  hint?: string;
}

export default function Input({ label, error, icon: Icon, className = "", hint, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        )}
        <input
          className={`input-field ${Icon ? "pl-10" : ""} ${error ? "border-danger/70 focus:border-danger focus:ring-danger/20" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={12} /> {error}
        </p>
      )}
      {hint && !error && <p className="mt-1.5 text-xs text-white/35">{hint}</p>}
    </div>
  );
}
