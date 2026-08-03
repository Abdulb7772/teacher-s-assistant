import { Request, Response } from "express";
import Course from "../models/Course";
import Student from "../models/Student";
import Quiz from "../models/Quiz";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { buildCourseFilters, courseSort, paginate } from "../services/courseService";
import { studentPerformanceAggregation, decorateWithGrade, quizSummary, StudentPerformanceBase } from "../services/quizService";

export const publicCourseOutline = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginate(req.query.page as string, req.query.limit as string);
  const filter = buildCourseFilters(req.query as Record<string, string>);
  const sort = courseSort(req.query as Record<string, string>);

  const [data, total] = await Promise.all([
    Course.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Course.countDocuments(filter),
  ]);

  res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const publicStudents = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginate(req.query.page as string, req.query.limit as string);
  const filter: Record<string, unknown> = {};
  const { search, className } = req.query as Record<string, string>;
  if (className) filter.class = className;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { rollNumber: { $regex: search, $options: "i" } },
      { registrationNumber: { $regex: search, $options: "i" } },
    ];
  }

  const pipeline: Parameters<typeof Student.aggregate>[0] = [
    { $match: filter },
    ...studentPerformanceAggregation(),
    { $sort: { percentage: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const [rows, total] = await Promise.all([Student.aggregate<StudentPerformanceBase>(pipeline), Student.countDocuments(filter)]);

  res.json({
    success: true,
    data: decorateWithGrade(rows),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const publicStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await Student.findById(req.params.id).lean();
  if (!student) throw new ApiError(404, "Student not found");

  const quizzes = await Quiz.find({ studentId: student._id }, "subject quizName obtainedMarks totalMarks date remarks")
    .sort({ date: -1 })
    .lean();
  res.json({ success: true, data: { student, quizzes, stats: quizSummary(quizzes) } });
});
