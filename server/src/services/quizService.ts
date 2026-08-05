import { PipelineStage } from "mongoose";
import { gradeFor, percentage } from "../utils/gradeUtils";

export interface StudentPerformanceBase {
  _id: unknown;
  name: string;
  rollNumber: string;
  registrationNumber?: string;
  email?: string;
  class?: string;
  subject?: string;
  createdAt?: Date;
  updatedAt?: Date;
  quizCount: number;
  average: number;
  percentage: number;
}

export interface StudentPerformance extends StudentPerformanceBase {
  grade: string;
}

export const studentPerformanceAggregation = (subject?: string): PipelineStage[] => [
  {
    $lookup: {
      from: "quizzes",
      localField: "_id",
      foreignField: "studentId",
      pipeline: subject ? [{ $match: { subject } }] : [],
      as: "quizzes",
    },
  },
  {
    $project: {
      name: 1,
      rollNumber: 1,
      registrationNumber: 1,
      email: 1,
      class: 1,
      subject: 1,
      createdAt: 1,
      updatedAt: 1,
      quizCount: { $size: "$quizzes" },
      average: { $avg: "$quizzes.obtainedMarks" },
      total: { $avg: "$quizzes.totalMarks" },
    },
  },
  {
    $addFields: {
      percentage: {
        $cond: [
          { $gt: ["$total", 0] },
          { $round: [{ $multiply: [{ $divide: ["$average", "$total"] }, 100] }, 1] },
          0,
        ],
      },
    },
  },
];

export const decorateWithGrade = (students: StudentPerformanceBase[]): StudentPerformance[] =>
  students.map((s) => ({ ...s, grade: gradeFor(s.percentage || 0) }));

export interface QuizSummary {
  average: number;
  percentage: number;
  grade: string;
}

export const quizSummary = (quizzes: { obtainedMarks: number; totalMarks: number }[]): QuizSummary => {
  if (!quizzes.length) return { average: 0, percentage: 0, grade: "F" };
  const obtained = quizzes.reduce((sum, q) => sum + q.obtainedMarks, 0);
  const total = quizzes.reduce((sum, q) => sum + q.totalMarks, 0);
  const avg = obtained / quizzes.length;
  return {
    average: Math.round(avg * 10) / 10,
    percentage: percentage(obtained, total),
    grade: gradeFor(percentage(obtained, total)),
  };
};
