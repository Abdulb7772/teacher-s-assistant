import { body } from "express-validator";
import { param } from "express-validator";

export const createUserValidators = [
  body("name").trim().notEmpty().withMessage("Full name is required").isLength({ max: 80 }).withMessage("Name too long"),
  body("email").trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain a special character"),
];

export const userIdParam = [param("id").isMongoId().withMessage("Invalid user ID")];

export const updateUserValidators = [
  ...userIdParam,
  body("name").trim().notEmpty().withMessage("Full name is required").isLength({ max: 80 }).withMessage("Name too long"),
  body("email").trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password")
    .optional({ values: "falsy" })
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain a special character"),
];
