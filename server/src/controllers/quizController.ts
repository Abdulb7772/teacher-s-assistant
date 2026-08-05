import { Request, Response } from "express";
import Quiz from "../models/Quiz";
import Student from "../models/Student";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { paginate } from "../services/courseService";
import { quizSummary } from "../services/quizService";

export const getQuizzes = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginate(req.query.page as string, req.query.limit as string);
  const filter: Record<string, unknown> = {};
  if (req.query.subject) filter.subject = req.query.subject;
  if (req.query.class) {
    const studentIds = await Student.find({ class: req.query.class }, "_id").lean();
    filter.studentId = { $in: studentIds.map((s) => s._id) };
  } else if (req.query.studentId) {
    filter.studentId = req.query.studentId;
  }
  if (req.query.search) filter.quizName = { $regex: req.query.search, $options: "i" };

  const [quizzes, total] = await Promise.all([
    Quiz.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("studentId", "name rollNumber class")
      .lean(),
    Quiz.countDocuments(filter),
  ]);

  const summary = typeof filter.studentId === "string" ? quizSummary(await Quiz.find(filter).lean()) : null;

  res.json({
    success: true,
    data: quizzes.map((q) => ({
      ...q,
      studentId: q.studentId?._id ?? q.studentId,
      student: q.studentId,
    })),
    summary,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const createQuizColumn = asyncHandler(async (req: Request, res: Response) => {
  const { quizName, totalMarks, date, className, subject } = req.body as {
    quizName: string;
    totalMarks: number;
    date?: string;
    className: string;
    subject: string;
  };

  const students = await Student.find({ class: className }, "_id").lean();
  if (!students.length) throw new ApiError(404, "No students found in this class");

  const existing = await Quiz.find(
    { quizName, subject, studentId: { $in: students.map((s) => s._id) } },
    "studentId"
  ).lean();
  const covered = new Set(existing.map((q) => q.studentId.toString()));
  const docs = students
    .filter((s) => !covered.has(s._id.toString()))
    .map((s) => ({
      studentId: s._id,
      subject,
      class: className,
      quizName,
      totalMarks,
      obtainedMarks: 0,
      date: date ? new Date(date) : new Date(),
    }));

  if (docs.length) await Quiz.insertMany(docs);
  res.status(201).json({ success: true, message: "Quiz column created", data: { created: docs.length } });
});

export const createQuiz = asyncHandler(async (req: Request, res: Response) => {
  const student = await Student.findById(req.body.studentId);
  if (!student) throw new ApiError(404, "Student not found");
  const quiz = await Quiz.create(req.body);
  res.status(201).json({ success: true, message: "Quiz mark added", data: quiz });
});

export const updateQuiz = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!quiz) throw new ApiError(404, "Quiz mark not found");
  res.json({ success: true, message: "Quiz mark updated", data: quiz });
});

export const deleteQuizColumn = asyncHandler(async (req: Request, res: Response) => {
  const { quizName, subject, class: className } = req.body as { quizName: string; subject: string; class: string };
  const deleted = await Quiz.deleteMany({ quizName, subject, class: className });
  if (!deleted.deletedCount) throw new ApiError(404, "Quiz column not found");
  res.json({ success: true, message: "Quiz column deleted", data: { deleted: deleted.deletedCount } });
});

export const deleteQuiz = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await Quiz.findByIdAndDelete(req.params.id);
  if (!quiz) throw new ApiError(404, "Quiz mark not found");
  res.json({ success: true, message: "Quiz mark deleted" });
});
