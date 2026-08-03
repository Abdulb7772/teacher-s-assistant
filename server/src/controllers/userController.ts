import { Request, Response } from "express";
import User from "../models/User";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, data: users.map((u) => u.toSafeJSON()) });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "A user with this email already exists");

  const user = await User.create({ name, email, password, role: "employee" });
  res.status(201).json({ success: true, message: "Employee account created", user: user.toSafeJSON() });
});
