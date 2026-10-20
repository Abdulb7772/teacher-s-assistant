import { Request, Response } from "express";
import ExamMark from "../models/ExamMark";
import Student from "../models/Student";
import Term from "../models/Term";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

export const getExamMarks = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.termId) filter.termId = req.query.termId;
  if (req.query.class) filter.class = req.query.class;
  if (req.query.subject) filter.subject = req.query.subject;

  const marks = await ExamMark.find(filter).sort({ createdAt: 1 }).lean();
  res.json({ success: true, data: marks });
});

export const saveExamMark = asyncHandler(async (req: Request, res: Response) => {
  const { termId, studentId, subject, totalMarks, obtainedMarks } = req.body as {
    termId: string;
    studentId: string;
    subject: string;
    totalMarks: number;
    obtainedMarks: number | null;
  };

  const student = await Student.findById(studentId);
  if (!student) throw new ApiError(404, "Student not found");

  const mark = await ExamMark.findOneAndUpdate(
    { termId, studentId, subject },
    { $set: { class: student.class, totalMarks, obtainedMarks } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.status(201).json({ success: true, message: "Marks saved", data: mark });
});

export const createExamSubjectColumn = asyncHandler(async (req: Request, res: Response) => {
  const { termId, className, subject, totalMarks } = req.body as {
    termId: string;
    className: string;
    subject: string;
    totalMarks: number;
  };

  const [term, students] = await Promise.all([
    Term.findById(termId),
    Student.find({ class: className }, "_id").lean(),
  ]);
  if (!term) throw new ApiError(404, "Term not found");
  if (!students.length) throw new ApiError(404, "No students found in this class");

  const existing = await ExamMark.findOne({ termId, class: className, subject });
  if (existing) throw new ApiError(409, `${subject} already has a marks column for this class`);

  const docs = students.map((student) => ({
    termId,
    studentId: student._id,
    class: className,
    subject,
    totalMarks,
    obtainedMarks: null,
  }));
  await ExamMark.insertMany(docs);

  res.status(201).json({ success: true, message: "Subject column created", data: { created: docs.length } });
});

export const updateExamMark = asyncHandler(async (req: Request, res: Response) => {
  const mark = await ExamMark.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!mark) throw new ApiError(404, "Exam mark not found");
  res.json({ success: true, message: "Marks saved", data: mark });
});

export const updateExamSubjectColumn = asyncHandler(async (req: Request, res: Response) => {
  const { termId, className, subject, newSubject, totalMarks } = req.body as {
    termId: string;
    className: string;
    subject: string;
    newSubject: string;
    totalMarks: number;
  };
  const updatedSubject = String(newSubject).trim();

  if (updatedSubject !== subject) {
    const existing = await ExamMark.findOne({ termId, class: className, subject: updatedSubject });
    if (existing) throw new ApiError(409, `${updatedSubject} already has a marks column for this class`);
  }

  const result = await ExamMark.updateMany(
    { termId, class: className, subject },
    { $set: { subject: updatedSubject, totalMarks } }
  );
  if (!result.matchedCount) throw new ApiError(404, "Subject column not found");

  res.json({ success: true, message: "Subject updated", data: { updated: result.modifiedCount } });
});

export const deleteExamSubjectColumn = asyncHandler(async (req: Request, res: Response) => {
  const { termId, className, subject } = req.body as { termId: string; className: string; subject: string };
  const deleted = await ExamMark.deleteMany({ termId, class: className, subject });
  if (!deleted.deletedCount) throw new ApiError(404, "Subject column not found");
  res.json({ success: true, message: "Subject column deleted", data: { deleted: deleted.deletedCount } });
});
