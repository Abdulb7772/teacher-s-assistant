"use client";

import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  shortcut?: string;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  shortcut = "/",
  className = "",
  inputRef,
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 pr-16"
        aria-label={placeholder}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/40 hover:text-white"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
      {shortcut && !value && (
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/15 px-1.5 py-0.5 text-[10px] font-semibold text-white/35 sm:block">
          {shortcut}
        </kbd>
      )}
    </div>
  );
}
