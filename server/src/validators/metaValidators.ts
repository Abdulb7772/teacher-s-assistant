import { body, param } from "express-validator";

export const subjectValidators = [
  body("name").trim().notEmpty().withMessage("Subject name is required").isLength({ max: 60 }).withMessage("Subject name too long"),
];

export const classValidators = [
  body("name").trim().notEmpty().withMessage("Class name is required").isLength({ max: 30 }).withMessage("Class name too long"),
];

export const importStudentsValidators = [
  body("sourceClasses").isArray({ min: 1 }).withMessage("Select at least one source class"),
  body("sourceClasses.*").trim().notEmpty().withMessage("Source class is required"),
];

export const metaIdParam = [param("id").isMongoId().withMessage("Invalid id")];
