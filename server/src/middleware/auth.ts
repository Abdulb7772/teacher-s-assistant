import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import ApiError from "../utils/ApiError";
import { COOKIE_NAME } from "../utils/cookieUtils";
import asyncHandler from "../utils/asyncHandler";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : undefined;
  const token = bearer || req.cookies?.[COOKIE_NAME];
  if (!token) throw new ApiError(401, "Not authorized, please sign in");

  let decoded: { id: string };
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
  } catch {
    throw new ApiError(401, "Session expired, please sign in again");
  }

  // Projection keeps per-request auth cheap (no full doc materialization).
  const user = await User.findById(decoded.id).select("name email role createdAt");
  if (!user) throw new ApiError(401, "Account no longer exists");

  req.user = user;
  next();
});

const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== "admin") {
    return next(new ApiError(403, "Admin access required"));
  }
  next();
};

export { protect, adminOnly };
