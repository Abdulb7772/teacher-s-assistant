import { useCallback, useEffect, useRef, useState } from "react";
import useDebounce from "./useDebounce";
import type { ApiErrorPayload } from "@/services/api";

interface QueryState<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  loading: boolean;
  error: string | null;
}

interface UsePaginatedQueryOptions {
  initialParams?: Record<string, string | number>;
}

type QueryFn<T> = (params: Record<string, unknown>) => Promise<{ data: T[]; pagination: unknown }>;

export default function usePaginatedQuery<T>(
  queryFn: QueryFn<T>,
  { initialParams = {} }: UsePaginatedQueryOptions = {}
) {
  const [params, setParams] = useState<Record<string, string | number>>({
    page: 1,
    limit: 10,
    ...initialParams,
  });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);

  useEffect(() => {
    setParams((p) => (p.page === 1 ? p : { ...p, page: 1 }));
  }, [search, params.limit]);

  const [state, setState] = useState<QueryState<T>>({
    data: [],
    pagination: null,
    loading: true,
    error: null,
  });

  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    setState((s) => ({ ...s, loading: s.data.length === 0, error: null }));
    queryFn({ ...params, search })
      .then((res) => {
        // Ignore stale responses: a newer filter/search/page request may have superseded this one.
        if (requestId !== requestIdRef.current) return;
        setState({
          data: res.data,
          pagination: res.pagination as QueryState<T>["pagination"],
          loading: false,
          error: null,
        });
      })
      .catch((err: ApiErrorPayload) => {
        if (requestId !== requestIdRef.current) return;
        if ((err as { message?: string })?.message === "canceled") return;
        setState((s) => ({ ...s, loading: false, error: err.message || "Failed to load" }));
      });
  }, [queryFn, params, search]);

  useEffect(() => {
    run();
    return () => {
      abortRef.current?.abort();
      requestIdRef.current++;
    };
  }, [run]);

  const setFilter = (key: string, value: string | number): void =>
    setParams((p) => ({ ...p, [key]: value, ...(key === "page" ? {} : { page: 1 }) }));

  return { ...state, params, setFilter, refresh: run, searchInput, setSearchInput, search };
}
