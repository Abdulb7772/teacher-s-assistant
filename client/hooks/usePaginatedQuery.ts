import { useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import useDebounce from "./useDebounce";
import type { ApiErrorPayload } from "@/services/api";
import type { Pagination } from "@/types";

interface QueryState<T> {
  data: T[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

interface UsePaginatedQueryOptions {
  initialParams?: Record<string, string | number>;
  staleTime?: number;
}

type QueryFn<T> = (params: Record<string, unknown>) => Promise<{ data: T[]; pagination: Pagination }>;

// Query-store-backed pagination: every distinct (page, filter, search) combo is
// cached under its own query key, so back-navigation and filter toggles are
// instant and never re-hit the network. keepPreviousData keeps the last page
// visible while the next one loads instead of flashing skeletons.
export default function usePaginatedQuery<T>(
  queryKey: readonly string[],
  queryFn: QueryFn<T>,
  { initialParams = {}, staleTime = 60 * 1000 }: UsePaginatedQueryOptions = {}
) {
  const [params, setParams] = useState<Record<string, string | number>>({
    page: 1,
    limit: 10,
    ...initialParams,
  });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);

  // Search and page-size changes always restart from page 1.
  useEffect(() => {
    setParams((p) => (p.page === 1 ? p : { ...p, page: 1 }));
  }, [search]);

  const queryParams = useMemo(() => ({ ...params, search }), [params, search]);

  const setFilter = useCallback((key: string, value: string | number): void => {
    setParams((p) => ({
      ...p,
      [key]: value,
      ...(key === "page" || key === "limit" ? {} : { page: 1 }),
    }));
  }, []);

  const { data, isPending, isError, error, refetch } = useQuery<{ data: T[]; pagination: Pagination }>({
    queryKey: [...queryKey, queryParams],
    queryFn: () => queryFn(queryParams),
    staleTime,
    placeholderData: keepPreviousData,
    retry: 1,
  });

  const state: QueryState<T> = {
    data: data?.data ?? [],
    pagination: data?.pagination ?? null,
    loading: isPending,
    error: isError ? (error as ApiErrorPayload).message || "Failed to load" : null,
  };

  return {
    ...state,
    params,
    setFilter,
    refresh: () => void refetch(),
    searchInput,
    setSearchInput,
    search,
  };
}
