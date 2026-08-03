import api from "./api";
import type { ApiResponse, Pagination, Student, StudentPerformance } from "@/lib/types";

export interface StudentFilters {
  page?: number;
  limit?: number;
  search?: string;
  class?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type StudentPayload = Omit<Student, "_id" | "createdAt" | "updatedAt">;

export const getStudents = (
  params: StudentFilters
): Promise<ApiResponse<StudentPerformance[]> & { pagination: Pagination }> =>
  api.get("/students", { params }).then((r) => r.data);

export const createStudent = (payload: StudentPayload): Promise<ApiResponse<Student>> =>
  api.post("/students", payload).then((r) => r.data);

export const updateStudent = (id: string, payload: StudentPayload): Promise<ApiResponse<Student>> =>
  api.put(`/students/${id}`, payload).then((r) => r.data);

export const deleteStudent = (id: string): Promise<ApiResponse<null>> =>
  api.delete(`/students/${id}`).then((r) => r.data);
