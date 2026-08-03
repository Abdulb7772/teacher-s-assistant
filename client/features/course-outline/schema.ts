import { z } from "zod";
import { MONTHS, WEEKS } from "@/lib/constants";

// Form fields arrive as strings (raw input values); numeric payloads are
// built with Number() at submit time, exactly like the previous Formik flow.

export const outlineFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  className: z.string().min(1, "Class is required"),
  month: z.string().min(1, "Month is required"),
  week: z
    .string()
    .min(1, "Week is required")
    .refine((v) => WEEKS.includes(Number(v)), "Week is required"),
  lectureNumber: z
    .string()
    .min(1, "Lecture number is required")
    .refine((v) => Number(v) >= 1, "Must be at least 1"),
  title: z.string().min(1, "Topic title is required"),
  description: z.string(),
  duration: z.string().min(1, "Duration is required"),
  notes: z.string(),
});

export type OutlineFormValues = z.infer<typeof outlineFormSchema>;

export const MONTH_FORM_OPTIONS = MONTHS.map((m) => ({ value: m, label: m }));
export const WEEK_FORM_OPTIONS = WEEKS.map((w) => ({ value: String(w), label: `Week ${w}` }));
