import { useQuery } from "@tanstack/react-query";
import * as analyticsService from "@/services/analyticsService";
import type { AnalyticsData } from "@/types";

// Shared key + staleTime across Dashboard and Analytics pages: navigating
// between them is a cache hit — one network request, ever.
export function useAnalyticsQuery() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: analyticsService.getAnalytics,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useAnalytics(): AnalyticsData | undefined {
  return useAnalyticsQuery().data?.data;
}
