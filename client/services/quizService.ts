import api from "./api";
import type { ApiResponse, Pagination, Quiz, QuizSummary } from "@/lib/types";

export interface QuizFilters {
  page?: number;
  limit?: number;
  studentId?: string;
  class?: string;
  subject?: string;
  search?: string;
}

export type QuizPayload = Omit<Quiz, "_id" | "createdAt" | "student">;

export interface QuizColumnPayload {
  className: string;
  subject: string;
  quizName: string;
  totalMarks: number;
  date?: string;
}

export const getQuizzes = (
  params: QuizFilters
): Promise<ApiResponse<Quiz[]> & { pagination: Pagination; summary: QuizSummary | null }> =>
  api.get("/quizzes", { params }).then((r) => r.data);

export const createQuiz = (payload: QuizPayload): Promise<ApiResponse<Quiz>> =>
  api.post("/quizzes", payload).then((r) => r.data);

export const createQuizColumn = (payload: QuizColumnPayload): Promise<ApiResponse<{ created: number }>> =>
  api.post("/quizzes/bulk", payload).then((r) => r.data);

export const updateQuiz = (id: string, payload: QuizPayload): Promise<ApiResponse<Quiz>> =>
  api.put(`/quizzes/${id}`, payload).then((r) => r.data);

export const deleteQuiz = (id: string): Promise<ApiResponse<null>> => api.delete(`/quizzes/${id}`).then((r) => r.data);
