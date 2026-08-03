import { Request, Response } from "express";
import SchoolClass from "../models/Class";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

export const getClasses = asyncHandler(async (_req: Request, res: Response) => {
  const classes = await SchoolClass.find().sort({ name: 1 }).lean();
  res.json({ success: true, data: classes });
});

export const createClass = asyncHandler(async (req: Request, res: Response) => {
  const name = String(req.body.name).trim();
  const existing = await SchoolClass.findOne({ name });
  if (existing) throw new ApiError(409, "Class already exists");
  const cls = await SchoolClass.create({ name });
  res.status(201).json({ success: true, message: "Class added", data: cls });
});

export const deleteClass = asyncHandler(async (req: Request, res: Response) => {
  const cls = await SchoolClass.findByIdAndDelete(req.params.id);
  if (!cls) throw new ApiError(404, "Class not found");
  res.json({ success: true, message: "Class deleted" });
});
