import { Request, Response } from "express";
import Course from "../models/Course";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { buildCourseFilters, courseSort, paginate } from "../services/courseService";

export const getCourses = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginate(req.query.page as string, req.query.limit as string);
  const filter = buildCourseFilters(req.query as Record<string, string>);
  const sort = courseSort(req.query as Record<string, string>);

  const [data, total] = await Promise.all([
    Course.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    Course.countDocuments(filter),
  ]);

  res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const createCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await Course.create({ ...req.body, createdBy: req.user!._id });
  res.status(201).json({ success: true, message: "Topic created", data: course });
});

export const updateCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!course) throw new ApiError(404, "Course topic not found");
  res.json({ success: true, message: "Topic updated", data: course });
});

export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) throw new ApiError(404, "Course topic not found");
  res.json({ success: true, message: "Topic deleted" });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, "Course topic not found");

  course.status = req.body.status;
  if (course.status === "completed") course.completionDate = new Date();
  else course.completionDate = null;

  await course.save();
  res.json({ success: true, message: `Topic marked as ${course.status}`, data: course });
});
