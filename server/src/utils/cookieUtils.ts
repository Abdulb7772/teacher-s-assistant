import jwt from "jsonwebtoken";
import { Response } from "express";

export const COOKIE_NAME = "token";

const getExpiry = (rememberMe: boolean): { days: number; ms: number } => {
  const days = rememberMe
    ? Number((process.env.JWT_REMEMBER_EXPIRES_IN || "30d").replace("d", ""))
    : Number((process.env.JWT_EXPIRES_IN || "7d").replace("d", ""));
  return { days, ms: days * 24 * 60 * 60 * 1000 };
};

export const signToken = (userId: string, rememberMe: boolean): string => {
  const { days } = getExpiry(rememberMe);
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, { expiresIn: `${days}d` });
};

export const setAuthCookie = (res: Response, userId: string, rememberMe: boolean): string => {
  const { ms } = getExpiry(rememberMe);
  const token = signToken(userId, rememberMe);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ms,
    path: "/",
  });
  return token;
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};
