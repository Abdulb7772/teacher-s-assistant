export const GRADE_BANDS = [
  { min: 95, grade: "A++", gpa: 5.0 },
  { min: 90, grade: "A+", gpa: 4.7 },
  { min: 85, grade: "A", gpa: 4.3 },
  { min: 80, grade: "B++", gpa: 4.0 },
  { min: 75, grade: "B+", gpa: 3.7 },
  { min: 70, grade: "B", gpa: 3.3 },
  { min: 65, grade: "C+", gpa: 3.0 },
  { min: 60, grade: "C", gpa: 3.0 },
  { min: 50, grade: "D", gpa: 2.0 },
  { min: 40, grade: "E", gpa: 1.0 },
  { min: 0, grade: "U", gpa: 0.0 },
];

export const percentage = (obtained: number, total: number): number =>
  total > 0 ? Math.round((obtained / total) * 1000) / 10 : 0;

export const gradeFor = (percent: number): string =>
  (GRADE_BANDS.find((b) => percent >= b.min) ?? GRADE_BANDS[GRADE_BANDS.length - 1]).grade;
