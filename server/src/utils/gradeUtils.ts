export const GRADE_BANDS = [
  { min: 90, grade: "A+" },
  { min: 85, grade: "A" },
  { min: 80, grade: "B+" },
  { min: 75, grade: "B" },
  { min: 70, grade: "C+" },
  { min: 65, grade: "C" },
  { min: 50, grade: "D" },
  { min: 0, grade: "F" },
];

export const percentage = (obtained: number, total: number): number =>
  total > 0 ? Math.round((obtained / total) * 1000) / 10 : 0;

export const gradeFor = (percent: number): string =>
  (GRADE_BANDS.find((b) => percent >= b.min) ?? GRADE_BANDS[GRADE_BANDS.length - 1]).grade;
