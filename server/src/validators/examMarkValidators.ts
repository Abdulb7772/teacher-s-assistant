import { body, param } from "express-validator";

export const examMarkValidators = [
  body("termId").isMongoId().withMessage("Select a valid term"),
  body("studentId").isMongoId().withMessage("Valid student id is required"),
  body("subject").trim().notEmpty().withMessage("Subject is required").isLength({ max: 60 }),
  body("totalMarks").isFloat({ min: 1 }).withMessage("Total marks must be a positive number"),
  body("obtainedMarks").optional({ nullable: true }).isFloat({ min: 0 }).withMessage("Obtained marks cannot be negative"),
];

export const examColumnValidators = [
  body("termId").isMongoId().withMessage("Select a valid term"),
  body("className").trim().notEmpty().withMessage("Class is required").isLength({ max: 30 }),
  body("subject").trim().notEmpty().withMessage("Subject is required").isLength({ max: 60 }),
  body("totalMarks").isFloat({ min: 1 }).withMessage("Total marks must be a positive number"),
];

export const examColumnDeleteValidators = [
  body("termId").isMongoId().withMessage("Select a valid term"),
  body("className").trim().notEmpty().withMessage("Class is required"),
  body("subject").trim().notEmpty().withMessage("Subject is required"),
];

export const examMarkIdParam = [param("id").isMongoId().withMessage("Invalid exam mark id")];
