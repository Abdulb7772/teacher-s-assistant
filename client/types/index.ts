export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export type CourseStatus = "pending" | "completed";

export interface Subject {
  _id: string;
  name: string;
  createdAt: string;
}

export interface SchoolClass {
  _id: string;
  name: string;
  createdAt: string;
}

export interface Course {
  _id: string;
  month: string;
  week: number;
  lectureNumber: number;
  subject?: string;
  class?: string;
  title: string;
  description: string;
  learningOutcomes: string[];
  duration: string;
  status: CourseStatus;
  completionDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  _id: string;
  name: string;
  rollNumber?: string;
  registrationNumber?: string;
  email?: string;
  class?: string;
  subject?: string;
  createdAt: string;
}

export interface StudentPerformance extends Student {
  quizCount: number;
  average: number;
  percentage: number;
  grade: string;
}

export interface Quiz {
  _id: string;
  studentId: string;
  subject?: string;
  class?: string;
  quizName: string;
  totalMarks: number;
  obtainedMarks: number;
  date: string;
  remarks?: string;
  createdAt: string;
  student?: Pick<Student, "_id" | "name" | "rollNumber" | "class">;
}

export interface QuizSummary {
  average: number;
  percentage: number;
  grade: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
  summary?: QuizSummary | null;
}

export interface MonthlyProgress {
  month: string;
  completed: number;
  pending: number;
  total: number;
}

export interface ActivityItem {
  type: "topic_completed" | "quiz_added" | "student_added";
  title: string;
  date: string;
  meta: string;
}

export interface AnalyticsData {
  totalCourses: number;
  completedTopics: number;
  pendingTopics: number;
  completionPercent: number;
  totalStudents: number;
  totalQuizzes: number;
  averageMarks: number;
  averagePercent: number;
  monthlyProgress: MonthlyProgress[];
  recentActivities: ActivityItem[];
  upcomingTopics: Course[];
  recentUpdates: { id: string; kind: "course" | "student"; title: string; meta: string; updatedAt: string }[];
  studentPerformance: StudentPerformance[];
  gradeDistribution: { grade: string; count: number }[];
}
