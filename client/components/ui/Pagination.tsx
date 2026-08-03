"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination as PaginationType } from "@/types";

export default function Pagination({
  pagination,
  onPageChange,
}: {
  pagination: PaginationType | null;
  onPageChange: (page: number) => void;
}) {
  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages, total, limit } = pagination;
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(pages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const items = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const btn = "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors";

  return (
    <div className="flex flex-col items-center justify-between gap-3 px-1 py-4 sm:flex-row">
      <p className="text-xs text-white/45">
        Showing <span className="font-semibold text-gold/80">{total === 0 ? 0 : (page - 1) * limit + 1}</span>–
        <span className="font-semibold text-gold/80">{Math.min(page * limit, total)}</span> of{" "}
        <span className="font-semibold text-white/70">{total}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`${btn} glass text-white/60 hover:text-white disabled:opacity-30`}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {items.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`${btn} ${
              p === page ? "bg-gold-gradient font-bold text-navy shadow-glow" : "glass text-white/60 hover:text-white"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className={`${btn} glass text-white/60 hover:text-white disabled:opacity-30`}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
