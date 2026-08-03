import { Request, Response } from "express";
import Subject from "../models/Subject";
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

export const deleteSubject = asyncHandler(async (req: Request, res: Response) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) throw new ApiError(404, "Subject not found");
  res.json({ success: true, message: "Subject deleted" });
});
