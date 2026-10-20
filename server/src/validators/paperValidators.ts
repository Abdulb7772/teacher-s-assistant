import { body, param } from "express-validator";

export const termValidators = [
  body("name").trim().notEmpty().withMessage("Term name is required").isLength({ max: 80 }),
  body("startDate").optional({ values: "falsy" }).isISO8601().withMessage("Invalid start date"),
  body("endDate").optional({ values: "falsy" }).isISO8601().withMessage("Invalid end date"),
];

export const paperValidators = [
  body("termId").isMongoId().withMessage("Select a valid term"),
  body("title").trim().notEmpty().withMessage("Paper title is required").isLength({ max: 200 }),
  body("subject").optional({ values: "falsy" }).trim().isLength({ max: 60 }),
  body("class").optional({ values: "falsy" }).trim().isLength({ max: 30 }),
];

export const paperIdParam = [param("id").isMongoId().withMessage("Invalid paper id")];
export const termIdParam = [param("id").isMongoId().withMessage("Invalid term id")];
