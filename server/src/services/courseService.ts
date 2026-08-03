import Course from "../models/Course";

interface CourseQuery {
  search?: string;
  month?: string;
  week?: string;
  status?: string;
  subject?: string;
  class?: string;
}

export const buildCourseFilters = ({ search, month, week, status, subject, class: cls }: CourseQuery): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};
  if (month) filter.month = month;
  if (week) filter.week = Number(week);
  if (status) filter.status = status;
  if (subject) filter.subject = subject;
  if (cls) filter.class = cls;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } },
    ];
  }
  return filter;
};

export const courseSort = ({ sortBy, sortOrder }: { sortBy?: string; sortOrder?: string }): Record<string, 1 | -1> => {
  const allowed = ["month", "week", "lectureNumber", "title", "status", "createdAt", "completionDate"];
  const key = allowed.includes(sortBy || "") ? (sortBy as string) : "createdAt";
  return { [key]: sortOrder === "asc" ? 1 : -1 };
};

export const paginate = (page?: string, limit?: string): { page: number; limit: number } => ({
  page: Math.max(1, Number(page) || 1),
  limit: Math.min(100, Math.max(1, Number(limit) || 10)),
});

export const courseModel = Course;
