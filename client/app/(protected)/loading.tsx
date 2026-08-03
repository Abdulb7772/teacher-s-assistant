"use client";

import { SkeletonCards, SkeletonRows } from "@/components/ui/Skeleton";

// Rendered while the next page's JS chunk downloads — instant perceived
// navigation before React Query data even starts loading.
export default function ProtectedLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-44 animate-shimmer rounded-lg bg-white/[0.06]" />
        <div className="h-8 w-64 animate-shimmer rounded-lg bg-white/[0.06]" />
      </div>
      <SkeletonCards count={4} />
      <div className="glass rounded-2xl p-4">
        <SkeletonRows rows={6} />
      </div>
    </div>
  );
}
