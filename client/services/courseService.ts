import api from "./api";
import type { ApiResponse, Course, CourseStatus, Pagination } from "@/lib/types";

export interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  month?: string;
  week?: string;
  status?: string;
  subject?: string;
  class?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type CoursePayload = Partial<Omit<Course, "_id" | "createdAt" | "updatedAt" | "createdBy">>;

export const getCourses = (params: CourseFilters): Promise<ApiResponse<Course[]> & { pagination: Pagination }> =>
  api.get("/course", { params }).then((r) => r.data);

export const createCourse = (payload: CoursePayload): Promise<ApiResponse<Course>> =>
  api.post("/course", payload).then((r) => r.data);

export const updateCourse = (id: string, payload: CoursePayload): Promise<ApiResponse<Course>> =>
  api.put(`/course/${id}`, payload).then((r) => r.data);

export const deleteCourse = (id: string): Promise<ApiResponse<null>> => api.delete(`/course/${id}`).then((r) => r.data);

export const updateCourseStatus = (id: string, status: CourseStatus): Promise<ApiResponse<Course>> =>
  api.patch(`/course/${id}/status`, { status }).then((r) => r.data);
