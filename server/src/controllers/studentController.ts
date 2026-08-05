import { Request, Response } from "express";
import Student from "../models/Student";
import Quiz from "../models/Quiz";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { paginate } from "../services/courseService";
import { studentPerformanceAggregation, decorateWithGrade, StudentPerformanceBase } from "../services/quizService";

const buildFilters = (query: Record<string, string>): Record<string, unknown> => {
  const { search, class: className, subject } = query;
  const filter: Record<string, unknown> = {};
  if (className) filter.class = className;
  if (subject) filter.subject = subject;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { rollNumber: { $regex: search, $options: "i" } },
      { registrationNumber: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  return filter;
};

export const getStudents = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginate(req.query.page as string, req.query.limit as string);
  const filter = buildFilters(req.query as Record<string, string>);
  const quizSubject = (req.query.quizSubject as string) || undefined;

  const pipeline: Parameters<typeof Student.aggregate>[0] = [
    { $match: filter },
    ...studentPerformanceAggregation(quizSubject),
    {
      $sort: {
        [req.query.sortBy === "percentage" ? "percentage" : "createdAt"]:
          req.query.sortOrder === "asc" ? 1 : -1,
      },
    },
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

const stripEmptyIdentity = (body: Record<string, unknown>): Record<string, unknown> => {
  const clean = { ...body };
  for (const key of ["rollNumber", "registrationNumber", "email"] as const) {
    if (typeof clean[key] === "string" && !String(clean[key]).trim()) delete clean[key];
  }
  return clean;
};

export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await Student.create(stripEmptyIdentity(req.body));
  res.status(201).json({ success: true, message: "Student added", data: student });
});

export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await Student.findByIdAndUpdate(req.params.id, stripEmptyIdentity(req.body), { new: true, runValidators: true });
  if (!student) throw new ApiError(404, "Student not found");
  res.json({ success: true, message: "Student updated", data: student });
});

export const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) throw new ApiError(404, "Student not found");
  await Quiz.deleteMany({ studentId: student._id });
  res.json({ success: true, message: "Student and their quizzes deleted" });
});
