import api from "./api";
import type { ApiResponse, Course, Pagination, Quiz, QuizSummary, StudentPerformance } from "@/types";
import type { CourseFilters } from "./courseService";
import type { StudentFilters } from "./studentService";

export const getPublicCourseOutline = (
  params: CourseFilters
): Promise<ApiResponse<Course[]> & { pagination: Pagination }> =>
  api.get("/public/course-outline", { params }).then((r) => r.data);

export const getPublicStudents = (
  params: StudentFilters
): Promise<ApiResponse<StudentPerformance[]> & { pagination: Pagination }> =>
  api.get("/public/students", { params }).then((r) => r.data);

export interface PublicStudentDetail {
  student: StudentPerformance;
  quizzes: Quiz[];
  stats: QuizSummary;
}

export const getPublicStudent = (id: string): Promise<ApiResponse<PublicStudentDetail>> =>
  api.get(`/public/student/${id}`).then((r) => r.data);
