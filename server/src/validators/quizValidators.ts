import { body, param } from "express-validator";

export const quizValidators = [
  body("studentId").isMongoId().withMessage("Valid student id is required"),
  body("quizName").trim().notEmpty().withMessage("Quiz name is required").isLength({ max: 120 }),
  body("totalMarks").isFloat({ min: 1 }).withMessage("Total marks must be a positive number"),
  body("obtainedMarks").isFloat({ min: 0 }).withMessage("Obtained marks cannot be negative"),
  body("subject").optional({ values: "falsy" }).trim().isLength({ max: 60 }),
  body("class").optional({ values: "falsy" }).trim().isLength({ max: 30 }),
  body("date").optional({ nullable: true }).isISO8601().withMessage("Invalid quiz date"),
  body("remarks").optional({ nullable: true }).trim().isLength({ max: 300 }),
];

export const quizColumnValidators = [
  body("subject").trim().notEmpty().withMessage("Subject is required").isLength({ max: 60 }),
  body("className").trim().notEmpty().withMessage("Class is required").isLength({ max: 30 }),
  body("quizName").trim().notEmpty().withMessage("Quiz name is required").isLength({ max: 120 }),
  body("totalMarks").isFloat({ min: 1 }).withMessage("Total marks must be a positive number"),
  body("date").optional({ nullable: true }).isISO8601().withMessage("Invalid quiz date"),
];

export const quizColumnDeleteValidators = [
  body("quizName").trim().notEmpty().withMessage("Quiz name is required").isLength({ max: 120 }),
  body("subject").trim().notEmpty().withMessage("Subject is required"),
  body("class").trim().notEmpty().withMessage("Class is required"),
];

export const quizIdParam = [param("id").isMongoId().withMessage("Invalid quiz id")];
