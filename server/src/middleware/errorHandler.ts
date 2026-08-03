import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";

const notFound = (req: Request, res: Response, next: NextFunction): void => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
  const error = err as Error & {
    statusCode?: number;
    errors?: unknown;
    name: string;
    code?: number;
    keyValue?: Record<string, unknown>;
    path?: string;
    value?: unknown;
  };

  let statusCode = error.statusCode || 500;
  let message = error.message || "Server error";
  let errors: unknown = (error as { errors?: unknown }).errors;

  if (error.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${error.path}: ${error.value}`;
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";
    statusCode = 409;
    message = `Duplicate value for ${field}: already in use`;
  }
  if (error.name === "ValidationError") {
    statusCode = 422;
    const errObj = error as unknown as { errors: Record<string, { message: string }> };
    message = Object.values(errObj.errors)
      .map((e) => e.message)
      .join(", ");
  }
  if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session expired, please sign in again";
  }
  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token, please sign in again";
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors || undefined,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
};

export { notFound, errorHandler };
