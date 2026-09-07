import { Request, Response } from "express";
import SchoolClass from "../models/Class";
import Student from "../models/Student";
import Quiz from "../models/Quiz";
import Course from "../models/Course";
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

export const updateClass = asyncHandler(async (req: Request, res: Response) => {
  const name = String(req.body.name).trim();
  const schoolClass = await SchoolClass.findById(req.params.id);
  if (!schoolClass) throw new ApiError(404, "Class not found");
  const existing = await SchoolClass.findOne({ name, _id: { $ne: schoolClass._id } });
  if (existing) throw new ApiError(409, "Class already exists");

  const previousName = schoolClass.name;
  schoolClass.name = name;
  await schoolClass.save();
  await Promise.all([
    Student.updateMany({ class: previousName }, { $set: { class: name } }),
    Quiz.updateMany({ class: previousName }, { $set: { class: name } }),
    Course.updateMany({ class: previousName }, { $set: { class: name } }),
  ]);
  res.json({ success: true, message: "Class updated", data: schoolClass });
});

export const importStudents = asyncHandler(async (req: Request, res: Response) => {
  const schoolClass = await SchoolClass.findById(req.params.id);
  if (!schoolClass) throw new ApiError(404, "Class not found");
  const sourceClasses = (req.body.sourceClasses as string[]).filter((name) => name !== schoolClass.name);
  const sourceStudents = await Student.find({ class: { $in: sourceClasses } });
  const newStudents = sourceStudents.map((student) => ({
    name: student.name,
    class: schoolClass.name,
  }));
  const result = await Student.insertMany(newStudents);
  res.json({
    success: true,
    message: `${result.length} student${result.length === 1 ? "" : "s"} imported`,
    data: { imported: result.length },
  });
});

export const deleteClass = asyncHandler(async (req: Request, res: Response) => {
  const cls = await SchoolClass.findByIdAndDelete(req.params.id);
  if (!cls) throw new ApiError(404, "Class not found");
  res.json({ success: true, message: "Class deleted" });
});
