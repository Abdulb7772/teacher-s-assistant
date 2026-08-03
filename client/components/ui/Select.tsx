"use client";

import { AlertCircle, ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
}

export default function Select({ label, error, options = [], className = "", ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`input-field appearance-none pr-10 ${error ? "border-danger/70" : ""} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-navy text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40" />
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}
