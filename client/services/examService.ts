import api from "./api";
import type { ApiResponse, ExamMark } from "@/types";

export interface ExamMarkPayload {
  termId: string;
  studentId: string;
  subject: string;
  totalMarks: number;
  obtainedMarks: number | null;
}

export interface ExamColumnPayload {
  termId: string;
  className: string;
  subject: string;
  totalMarks: number;
}

export const getExamMarks = (params: {
  termId?: string;
  class?: string;
  subject?: string;
}): Promise<ApiResponse<ExamMark[]>> => api.get("/exam-marks", { params }).then((r) => r.data);

export const saveExamMark = (payload: ExamMarkPayload): Promise<ApiResponse<ExamMark>> =>
  api.post("/exam-marks", payload).then((r) => r.data);

export const updateExamMark = (id: string, payload: ExamMarkPayload): Promise<ApiResponse<ExamMark>> =>
  api.put(`/exam-marks/${id}`, payload).then((r) => r.data);

export const createExamColumn = (payload: ExamColumnPayload): Promise<ApiResponse<{ created: number }>> =>
  api.post("/exam-marks/column", payload).then((r) => r.data);

export const deleteExamColumn = (payload: {
  termId: string;
  className: string;
  subject: string;
}): Promise<ApiResponse<{ deleted: number }>> =>
  api.delete("/exam-marks/column", { data: payload }).then((r) => r.data);
