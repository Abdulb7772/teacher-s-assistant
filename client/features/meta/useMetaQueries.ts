import { useQuery } from "@tanstack/react-query";
import * as subjectService from "@/services/subjectService";
import * as classService from "@/services/classService";

// Subjects/classes are small, rarely change, and drive filters on 5+ pages.
// Long staleTime + gcTime + shared keys => fetched once, served from cache,
// invalidated only by the Subjects & Classes page after a mutation.
//
// retry/refetch overrides: the global defaults (retry 1, no mount/focus
// refetch) would cache a failed fetch in error state forever — a transient
// backend restart (tsx watch reloads) would leave every dropdown silently
// empty until a full page reload. These options only refetch stale or
// errored queries, so the 30-min cache behavior is unchanged when healthy.
export const META_STALE_TIME = 30 * 60 * 1000;

const META_RETRY_OPTIONS = { retry: 3, refetchOnWindowFocus: true, refetchOnMount: true } as const;

export function useSubjectsQuery() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: subjectService.getSubjects,
    staleTime: META_STALE_TIME,
    gcTime: 60 * 60 * 1000,
    ...META_RETRY_OPTIONS,
  });
}

export function useClassesQuery() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: classService.getClasses,
    staleTime: META_STALE_TIME,
    gcTime: 60 * 60 * 1000,
    ...META_RETRY_OPTIONS,
  });
}

export const META_KEYS = [["subjects"], ["classes"]] as const;
