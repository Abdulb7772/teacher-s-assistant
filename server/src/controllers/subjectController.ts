import { Request, Response } from "express";
import Subject from "../models/Subject";
import Student from "../models/Student";
import Quiz from "../models/Quiz";
import Course from "../models/Course";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

export const getSubjects = asyncHandler(async (_req: Request, res: Response) => {
  const subjects = await Subject.find().sort({ name: 1 }).lean();
  res.json({ success: true, data: subjects });
});

export const createSubject = asyncHandler(async (req: Request, res: Response) => {
  const name = String(req.body.name).trim();
  const existing = await Subject.findOne({ name });
  if (existing) throw new ApiError(409, "Subject already exists");
  const subject = await Subject.create({ name });
  res.status(201).json({ success: true, message: "Subject added", data: subject });
});

export const updateSubject = asyncHandler(async (req: Request, res: Response) => {
  const name = String(req.body.name).trim();
  const subject = await Subject.findById(req.params.id);
  if (!subject) throw new ApiError(404, "Subject not found");
  const existing = await Subject.findOne({ name, _id: { $ne: subject._id } });
  if (existing) throw new ApiError(409, "Subject already exists");

  const previousName = subject.name;
  subject.name = name;
  await subject.save();
  await Promise.all([
    Student.updateMany({ subject: previousName }, { $set: { subject: name } }),
    Quiz.updateMany({ subject: previousName }, { $set: { subject: name } }),
    Course.updateMany({ subject: previousName }, { $set: { subject: name } }),
  ]);
  res.json({ success: true, message: "Subject updated", data: subject });
});

export const deleteSubject = asyncHandler(async (req: Request, res: Response) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) throw new ApiError(404, "Subject not found");
  res.json({ success: true, message: "Subject deleted" });
});
