"use client";

import Skeleton from "@/components/ui/Skeleton";
import { SkeletonCards, SkeletonRows } from "@/components/ui/Skeleton";

export default function PublicLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <SkeletonCards count={4} />
      <div className="glass mt-10 rounded-2xl p-6">
        <SkeletonRows rows={6} />
      </div>
    </div>
  );
}
