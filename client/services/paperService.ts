import api from "./api";
import type { ApiResponse, Paper, Term } from "@/types";

export const getTerms = (): Promise<ApiResponse<Term[]>> => api.get("/terms").then((r) => r.data);

export const createTerm = (payload: { name: string; startDate?: string; endDate?: string }): Promise<ApiResponse<Term>> =>
  api.post("/terms", payload).then((r) => r.data);

export const deleteTerm = (id: string): Promise<ApiResponse<null>> => api.delete(`/terms/${id}`).then((r) => r.data);

export const getPapers = (params: { termId?: string; search?: string }): Promise<ApiResponse<Paper[]>> =>
  api.get("/papers", { params }).then((r) => r.data);

export const uploadPaper = (payload: {
  termId: string;
  title: string;
  subject?: string;
  class?: string;
  file: File;
}): Promise<ApiResponse<Paper>> => {
  const form = new FormData();
  form.append("termId", payload.termId);
  form.append("title", payload.title);
  if (payload.subject) form.append("subject", payload.subject);
  if (payload.class) form.append("class", payload.class);
  form.append("file", payload.file);
  return api.post("/papers", form).then((r) => r.data);
};

export const deletePaper = (id: string): Promise<ApiResponse<null>> => api.delete(`/papers/${id}`).then((r) => r.data);
