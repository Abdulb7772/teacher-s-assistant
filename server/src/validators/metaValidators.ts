import { body, param } from "express-validator";

export const subjectValidators = [
  body("name").trim().notEmpty().withMessage("Subject name is required").isLength({ max: 60 }).withMessage("Subject name too long"),
];

export const classValidators = [
  body("name").trim().notEmpty().withMessage("Class name is required").isLength({ max: 30 }).withMessage("Class name too long"),
];

export const metaIdParam = [param("id").isMongoId().withMessage("Invalid id")];
