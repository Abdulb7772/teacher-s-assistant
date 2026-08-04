import { body, param } from "express-validator";

export const studentValidators = [
  body("name").trim().notEmpty().withMessage("Full name is required").isLength({ max: 80 }),
  body("class").optional({ values: "falsy" }).trim().isLength({ max: 30 }).withMessage("Class name too long"),
  body("subject").optional({ values: "falsy" }).trim().isLength({ max: 60 }).withMessage("Subject name too long"),
];

export const studentIdParam = [param("id").isMongoId().withMessage("Invalid student id")];
