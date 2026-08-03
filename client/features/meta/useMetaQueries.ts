import { useQuery } from "@tanstack/react-query";
import * as subjectService from "@/services/subjectService";
import * as classService from "@/services/classService";

// Subjects/classes are small, rarely change, and drive filters on 5+ pages.
// Long staleTime + gcTime + shared keys => fetched once, served from cache,
// invalidated only by the Subjects & Classes page after a mutation.
export const META_STALE_TIME = 30 * 60 * 1000;

export function useSubjectsQuery() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: subjectService.getSubjects,
    staleTime: META_STALE_TIME,
    gcTime: 60 * 60 * 1000,
  });
}

export function useClassesQuery() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: classService.getClasses,
    staleTime: META_STALE_TIME,
    gcTime: 60 * 60 * 1000,
  });
}

export const META_KEYS = [["subjects"], ["classes"]] as const;
