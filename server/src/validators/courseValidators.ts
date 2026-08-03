import { body, param } from "express-validator";
import { MONTHS } from "../models/Course";

export const courseValidators = [
  body("subject").trim().notEmpty().withMessage("Subject is required").isLength({ max: 60 }),
  body("class").trim().notEmpty().withMessage("Class is required").isLength({ max: 30 }),
  body("month").trim().isIn(MONTHS as unknown as string[]).withMessage(`Month must be one of: ${MONTHS.join(", ")}`),
  body("week").isInt({ min: 1, max: 5 }).withMessage("Week must be between 1 and 5"),
  body("lectureNumber").isInt({ min: 1 }).withMessage("Lecture number must be a positive number"),
  body("title").trim().notEmpty().withMessage("Topic title is required").isLength({ max: 200 }),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("learningOutcomes").optional().isArray().withMessage("Learning outcomes must be an array"),
  body("duration").optional().trim().isLength({ max: 40 }),
  body("notes").optional().trim().isLength({ max: 1000 }),
  body("status").optional().isIn(["pending", "completed"]).withMessage("Status must be pending or completed"),
  body("completionDate").optional({ nullable: true }).isISO8601().withMessage("Invalid completion date"),
];

export const courseIdParam = [param("id").isMongoId().withMessage("Invalid course id")];

export const statusValidator = [body("status").isIn(["pending", "completed"]).withMessage("Status must be pending or completed")];
