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

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  if (req.params.id === req.user?.id) throw new ApiError(400, "You cannot edit your own admin account here");
  const user = await User.findById(req.params.id).select("+password");
  if (!user) throw new ApiError(404, "User not found");
  if (user.role !== "employee") throw new ApiError(403, "Only employee accounts can be edited");

  const { name, email, password } = req.body as { name: string; email: string; password?: string };
  const existing = await User.findOne({ email, _id: { $ne: user._id } });
  if (existing) throw new ApiError(409, "A user with this email already exists");
  user.name = name;
  user.email = email;
  if (password) user.password = password;
  await user.save();
  res.json({ success: true, message: "Employee account updated", user: user.toSafeJSON() });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  if (req.params.id === req.user?.id) throw new ApiError(400, "You cannot delete your own admin account");
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role !== "employee") throw new ApiError(403, "Only employee accounts can be deleted");
  await user.deleteOne();
  res.json({ success: true, message: "Employee account deleted" });
});
