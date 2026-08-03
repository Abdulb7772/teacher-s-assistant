import { body } from "express-validator";

export const PASSWORD_RULES = {
  min: 8,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /\d/,
  special: /[^A-Za-z0-9]/,
};

const passwordChecks = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(PASSWORD_RULES.uppercase)
    .withMessage("Password must contain an uppercase letter")
    .matches(PASSWORD_RULES.lowercase)
    .withMessage("Password must contain a lowercase letter")
    .matches(PASSWORD_RULES.number)
    .withMessage("Password must contain a number")
    .matches(PASSWORD_RULES.special)
    .withMessage("Password must contain a special character"),
];

export const loginValidators = [
  body("email").trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const updateProfileValidators = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty").isLength({ max: 80 }),
  body("email").optional().trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
];

export const updatePasswordValidators = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  ...passwordChecks,
];
