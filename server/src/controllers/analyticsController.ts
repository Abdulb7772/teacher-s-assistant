import { Request, Response } from "express";
import Course from "../models/Course";
import Student from "../models/Student";
import Quiz from "../models/Quiz";
import asyncHandler from "../utils/asyncHandler";
import { studentPerformanceAggregation, decorateWithGrade, StudentPerformanceBase } from "../services/quizService";

export const analytics = asyncHandler(async (req: Request, res: Response) => {
  // Projections: only the fields each widget needs, cutting payload + doc deserialization cost.
  const [courses, students, quizzes] = await Promise.all([
    Course.find(
      {},
      "title month week lectureNumber status completionDate createdAt updatedAt"
    ).lean(),
    Student.find({}, "name rollNumber createdAt updatedAt").lean(),
    Quiz.find({}, "quizName obtainedMarks totalMarks date").lean(),
  ]);

  const completed = courses.filter((c) => c.status === "completed");
  const pending = courses.length - completed.length;
  const completionPercent = courses.length ? Math.round((completed.length / courses.length) * 100) : 0;

  const totalMarks = quizzes.reduce((s, q) => s + q.totalMarks, 0);
  const obtainedMarks = quizzes.reduce((s, q) => s + q.obtainedMarks, 0);
  const averageMarks = quizzes.length ? Math.round((obtainedMarks / quizzes.length) * 10) / 10 : 0;
  const averagePercent = totalMarks ? Math.round((obtainedMarks / totalMarks) * 1000) / 10 : 0;

  // Single pass over courses instead of 36 filter() scans.
  const completedByMonth = new Map<number, number>();
  const totalsByMonth = new Map<string, { pending: number; total: number }>();
  for (const c of courses) {
    if (c.status === "completed" && c.completionDate) {
      const idx = new Date(c.completionDate).getMonth();
      completedByMonth.set(idx, (completedByMonth.get(idx) ?? 0) + 1);
    }
    const bucket = totalsByMonth.get(c.month) ?? { pending: 0, total: 0 };
    bucket.total++;
    if (c.status === "pending") bucket.pending++;
    totalsByMonth.set(c.month, bucket);
  }
  const monthlyProgress = Array.from({ length: 12 }, (_, i) => {
    const monthName = new Date(2000, i, 1).toLocaleString("en-US", { month: "long" });
    const bucket = totalsByMonth.get(monthName) ?? { pending: 0, total: 0 };
    return {
      month: monthName,
      completed: completedByMonth.get(i) ?? 0,
      pending: bucket.pending,
      total: bucket.total,
    };
  });

  const recentActivities = [
    ...completed.map((c) => ({
      type: "topic_completed",
      title: c.title,
      date: c.completionDate,
      meta: `${c.month} · Lecture ${c.lectureNumber}`,
    })),
    ...quizzes.map((q) => ({
      type: "quiz_added",
      title: q.quizName,
      date: q.date,
      meta: `${q.obtainedMarks}/${q.totalMarks}`,
    })),
    ...students.map((s) => ({ type: "student_added", title: s.name, date: s.createdAt, meta: s.rollNumber })),
  ]
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
    .slice(0, 8);

  const upcomingTopics = courses
    .filter((c) => c.status === "pending")
    .sort((a, b) => a.lectureNumber - b.lectureNumber)
    .slice(0, 6);

  const recentUpdates = [...courses, ...students]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8)
    .map((item) => ({
      id: item._id,
      kind: "lectureNumber" in item ? "course" : "student",
      title: "lectureNumber" in item ? (item as typeof courses[0]).title : (item as typeof students[0]).name,
      meta: "lectureNumber" in item ? `${(item as typeof courses[0]).month} · ${(item as typeof courses[0]).status}` : (item as typeof students[0]).rollNumber,
      updatedAt: item.updatedAt,
    }));

  const performanceRows = await Student.aggregate<StudentPerformanceBase>(studentPerformanceAggregation());
  const studentPerformance = decorateWithGrade(performanceRows)
    .filter((s) => s.quizCount > 0)
    .sort((a, b) => b.percentage - a.percentage);

  const gradeBuckets = ["A+", "A", "B+", "B", "C+", "C", "D", "F"];
  const gradeDistribution = gradeBuckets.map((grade) => ({
    grade,
    count: studentPerformance.filter((s) => s.grade === grade).length,
  }));

  res.json({
    success: true,
    data: {
      totalCourses: courses.length,
      completedTopics: completed.length,
      pendingTopics: pending,
      completionPercent,
      totalStudents: students.length,
      totalQuizzes: quizzes.length,
      averageMarks,
      averagePercent,
      monthlyProgress,
      recentActivities,
      upcomingTopics,
      recentUpdates,
      studentPerformance,
      gradeDistribution,
    },
  });
});
