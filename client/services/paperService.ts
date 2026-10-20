import api from "./api";
import type { ApiResponse, Paper, Term } from "@/types";

export const getTerms = (): Promise<ApiResponse<Term[]>> => api.get("/terms").then((r) => r.data);

export const createTerm = (payload: { name: string; startDate?: string; endDate?: string }): Promise<ApiResponse<Term>> =>
  api.post("/terms", payload).then((r) => r.data);

export const updateTerm = (
  id: string,
  payload: { name: string; startDate?: string; endDate?: string }
): Promise<ApiResponse<Term>> => api.put(`/terms/${id}`, payload).then((r) => r.data);

export const deleteTerm = (id: string): Promise<ApiResponse<null>> => api.delete(`/terms/${id}`).then((r) => r.data);

export const getPapers = (params: { termId?: string; search?: string }): Promise<ApiResponse<Paper[]>> =>
  api.get("/papers", { params }).then((r) => r.data);

export interface CloudinaryUpload {
  secure_url: string;
  public_id: string;
  resource_type: string;
  bytes: number;
  pages?: number;
}

const MAX_PDF_SIZE = 20 * 1024 * 1024;

export const uploadPaperFile = async (payload: {
  termId: string;
  title: string;
  subject?: string;
  class?: string;
  file: File;
}): Promise<ApiResponse<Paper>> => {
  const { file } = payload;
  if (!/\.pdf$/i.test(file.name)) throw new Error("Only PDF files are allowed");
  if (file.size > MAX_PDF_SIZE) throw new Error("PDF must be 20 MB or smaller");

  const form = new FormData();
  form.append("termId", payload.termId);
  form.append("title", payload.title);
  if (payload.subject) form.append("subject", payload.subject);
  if (payload.class) form.append("class", payload.class);
  form.append("file", file);
  return api.post("/papers/upload", form).then((r) => r.data);
};

export const uploadPaper = (payload: {
  termId: string;
  title: string;
  subject?: string;
  class?: string;
  fileUrl: string;
  publicId: string;
  resourceType: string;
  pages?: number;
  originalName: string;
  mimeType: string;
  size: number;
}): Promise<ApiResponse<Paper>> => api.post("/papers", payload).then((r) => r.data);

export const deletePaper = (id: string): Promise<ApiResponse<null>> => api.delete(`/papers/${id}`).then((r) => r.data);
