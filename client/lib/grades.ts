const GRADE_BANDS = [
  { min: 95, grade: "A++", color: "success", gpa: 5.0 },
  { min: 90, grade: "A+", color: "success", gpa: 4.7 },
  { min: 85, grade: "A", color: "success", gpa: 4.3 },
  { min: 80, grade: "B++", color: "gold", gpa: 4.0 },
  { min: 75, grade: "B+", color: "gold", gpa: 3.7 },
  { min: 70, grade: "B", color: "gold", gpa: 3.3 },
  { min: 65, grade: "C+", color: "gold", gpa: 3.0 },
  { min: 60, grade: "C", color: "gold", gpa: 3.0 },
  { min: 50, grade: "D", color: "blue", gpa: 2.0 },
  { min: 40, grade: "E", color: "danger", gpa: 1.0 },
  { min: 0, grade: "U", color: "danger", gpa: 0.0 },
] as const;

export type Grade = (typeof GRADE_BANDS)[number]["grade"];
export type GradeColor = (typeof GRADE_BANDS)[number]["color"];

export const PASS_PERCENT = 40;

export const percentageOf = (obtained: number, total: number): number =>
  total > 0 ? Math.round((obtained / total) * 1000) / 10 : 0;

export const gradeFor = (percent: number): { grade: Grade; color: GradeColor; gpa: number } =>
  GRADE_BANDS.find((b) => percent >= b.min) ?? GRADE_BANDS[GRADE_BANDS.length - 1];
