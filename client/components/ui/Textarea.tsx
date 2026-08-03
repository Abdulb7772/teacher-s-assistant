"use client";

import { AlertCircle } from "lucide-react";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60">
          {label}
        </label>
      )}
      <textarea
        className={`input-field min-h-[90px] resize-y ${error ? "border-danger/70" : ""} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}
