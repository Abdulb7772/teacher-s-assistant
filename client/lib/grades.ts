const GRADE_BANDS = [
  { min: 90, grade: "A+", color: "success" },
  { min: 85, grade: "A", color: "success" },
  { min: 80, grade: "B+", color: "gold" },
  { min: 75, grade: "B", color: "gold" },
  { min: 70, grade: "C+", color: "gold" },
  { min: 65, grade: "C", color: "gold" },
  { min: 50, grade: "D", color: "danger" },
  { min: 0, grade: "F", color: "danger" },
] as const;

export type Grade = (typeof GRADE_BANDS)[number]["grade"];
export type GradeColor = (typeof GRADE_BANDS)[number]["color"];

export const percentageOf = (obtained: number, total: number): number =>
  total > 0 ? Math.round((obtained / total) * 1000) / 10 : 0;

export const gradeFor = (percent: number): { grade: Grade; color: GradeColor } =>
  GRADE_BANDS.find((b) => percent >= b.min) ?? GRADE_BANDS[GRADE_BANDS.length - 1];
