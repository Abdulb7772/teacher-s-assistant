import Course, { MONTHS } from "../models/Course";

interface CourseQuery {
  search?: string;
  month?: string;
  week?: string;
  status?: string;
  subject?: string;
  class?: string;
  createdBy?: string;
}

export const buildCourseFilters = ({ search, month, week, status, subject, class: cls, createdBy }: CourseQuery): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};
  if (month) filter.month = month;
  if (week) filter.week = Number(week);
  if (status) filter.status = status;
  if (subject) filter.subject = subject;
  if (cls) filter.class = cls;
  if (createdBy) filter.createdBy = createdBy;
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
  const order = sortOrder === "asc" ? 1 : -1;
  // Month uses the calendar sequence, not alphabetic order.
  if (key === "month") return { month: order, week: 1, lectureNumber: 1 };
  // Week always groups week 1 first, then week 2, lectures ascending inside the group.
  if (key === "week") return { week: order, lectureNumber: 1 };
  return { [key]: order, lectureNumber: 1 };
};

export const buildCourseMonthSortPipeline = (
  filter: Record<string, unknown>,
  page: number,
  limit: number,
  sortOrder?: string
) => {
  const monthDirection = sortOrder === "asc" ? 1 : -1;

  return [
    { $match: filter },
    {
      $addFields: {
        monthIndex: {
          $indexOfArray: [MONTHS as unknown as string[], "$month"],
        },
      },
    },
    { $sort: { monthIndex: monthDirection, week: 1, lectureNumber: 1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    { $project: { monthIndex: 0 } },
  ] as const;
};

export const paginate = (page?: string, limit?: string): { page: number; limit: number } => ({
  page: Math.max(1, Number(page) || 1),
  limit: Math.min(100, Math.max(1, Number(limit) || 10)),
});

export const courseModel = Course;
