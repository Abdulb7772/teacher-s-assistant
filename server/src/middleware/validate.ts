import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const mapped = errors.array().map((e) => ({ field: e.type === "field" ? e.path : "form", message: e.msg }));
  res.status(422).json({ success: false, message: mapped[0].message, errors: mapped });
};

export default validate;
