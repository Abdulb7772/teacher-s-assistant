import { z } from "zod";

export const studentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  className: z.string(),
  subjectName: z.string(),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;

export const userFormSchema = z
  .object({
    name: z.string().min(1, "Name is required").min(3, "Name is too short"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "One uppercase letter")
      .regex(/[a-z]/, "One lowercase letter")
      .regex(/\d/, "One number")
      .regex(/[^A-Za-z0-9]/, "One special character"),
    confirmPassword: z.string().min(1, "Please confirm the password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UserFormValues = z.infer<typeof userFormSchema>;

export const nameFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(60, "Too long"),
});

export type NameFormValues = z.infer<typeof nameFormSchema>;

export const PROFILE_SCHEMA = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

export type ProfileFormValues = z.infer<typeof PROFILE_SCHEMA>;

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const SECURITY_SCHEMA = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .regex(PASSWORD_RULES, "Must be 8+ characters with upper, lower, number and special character"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SecurityFormValues = z.infer<typeof SECURITY_SCHEMA>;

export const quizColumnSchema = z.object({
  quizName: z.string().min(1, "Quiz name is required"),
  totalMarks: z
    .string()
    .min(1, "Total marks is required")
    .refine((v) => Number(v) >= 1, "Must be at least 1"),
  date: z.string().min(1, "Date is required"),
});

export type QuizColumnFormValues = z.infer<typeof quizColumnSchema>;

export const quizCellSchema = z.object({
  obtainedMarks: z
    .string()
    .min(1, "Obtained marks is required")
    .refine((v) => Number(v) >= 0, "Cannot be negative"),
  totalMarks: z
    .string()
    .min(1, "Total marks is required")
    .refine((v) => Number(v) >= 1, "Must be at least 1"),
  remarks: z.string(),
});

export type QuizCellFormValues = z.infer<typeof quizCellSchema>;
