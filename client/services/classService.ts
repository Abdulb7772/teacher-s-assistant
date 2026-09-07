import api from "./api";
import type { ApiResponse, SchoolClass } from "@/types";

export const getClasses = (): Promise<ApiResponse<SchoolClass[]>> => api.get("/classes").then((r) => r.data);

export const createClass = (payload: { name: string }): Promise<ApiResponse<SchoolClass>> =>
  api.post("/classes", payload).then((r) => r.data);

export const updateClass = (id: string, payload: { name: string }): Promise<ApiResponse<SchoolClass>> =>
  api.put(`/classes/${id}`, payload).then((r) => r.data);

export const importStudents = (id: string, sourceClasses: string[]): Promise<ApiResponse<{ imported: number }>> =>
  api.post(`/classes/${id}/import-students`, { sourceClasses }).then((r) => r.data);

export const deleteClass = (id: string): Promise<ApiResponse<null>> => api.delete(`/classes/${id}`).then((r) => r.data);
