import { Request, Response } from "express";
import User from "../models/User";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { setAuthCookie, clearAuthCookie } from "../utils/cookieUtils";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body as { email: string; password: string; rememberMe?: boolean };

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = setAuthCookie(res, user._id.toString(), Boolean(rememberMe));
  res.json({ success: true, message: "Welcome back", user: user.toSafeJSON(), token, remembered: Boolean(rememberMe) });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({ success: true, message: "Signed out successfully" });
});

export const profile = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, user: req.user!.toSafeJSON(), remembered: req.remembered ?? false });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, email } = req.body as { name?: string; email?: string };
  const updates: Record<string, string> = {};
  if (name) updates.name = name;
  if (email && email !== req.user!.email) {
    const taken = await User.findOne({ email });
    if (taken) throw new ApiError(409, "Email is already in use");
    updates.email = email;
  }
  const user = await User.findByIdAndUpdate(req.user!._id, updates, { new: true, runValidators: true });
  res.json({ success: true, message: "Profile updated", user: user!.toSafeJSON() });
});

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  const user = await User.findById(req.user!._id).select("+password");
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }
  user.password = newPassword;
  await user.save();
  setAuthCookie(res, user._id.toString(), true);
  res.json({ success: true, message: "Password updated successfully" });
});
