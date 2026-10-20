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
}

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "aq49gwvn";
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "teachers_assistant";
const MAX_PDF_SIZE = 20 * 1024 * 1024;

export const uploadPaperFile = async (file: File): Promise<CloudinaryUpload> => {
  if (!/\.pdf$/i.test(file.name)) throw new Error("Only PDF files are allowed");
  if (file.size > MAX_PDF_SIZE) throw new Error("PDF must be 20 MB or smaller");

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
    method: "POST",
    body: form,
  });
  const data = (await response.json()) as CloudinaryUpload & { error?: { message?: string } };
  if (!response.ok || data.error) throw new Error(data.error?.message || "Cloudinary upload failed");
  return data;
};

export const uploadPaper = (payload: {
  termId: string;
  title: string;
  subject?: string;
  class?: string;
  fileUrl: string;
  publicId: string;
  resourceType: string;
  originalName: string;
  mimeType: string;
  size: number;
}): Promise<ApiResponse<Paper>> => api.post("/papers", payload).then((r) => r.data);

export const deletePaper = (id: string): Promise<ApiResponse<null>> => api.delete(`/papers/${id}`).then((r) => r.data);
