import api from "./api";
import type { ApiResponse, Subject } from "@/types";

export const getSubjects = (): Promise<ApiResponse<Subject[]>> => api.get("/subjects").then((r) => r.data);

export const createSubject = (payload: { name: string }): Promise<ApiResponse<Subject>> =>
  api.post("/subjects", payload).then((r) => r.data);

export const deleteSubject = (id: string): Promise<ApiResponse<null>> => api.delete(`/subjects/${id}`).then((r) => r.data);
