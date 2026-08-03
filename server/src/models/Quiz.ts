import mongoose, { Schema, Document } from "mongoose";

export interface IQuiz extends Document {
  studentId: mongoose.Types.ObjectId;
  subject?: string;
  class?: string;
  quizName: string;
  totalMarks: number;
  obtainedMarks: number;
  date: Date;
  remarks: string;
  createdAt: Date;
}

const quizSchema = new Schema<IQuiz>(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: [true, "Student is required"], index: true },
    subject: { type: String, trim: true, index: true },
    class: { type: String, trim: true, index: true },
    quizName: { type: String, required: [true, "Quiz name is required"], trim: true, maxlength: [120, "Quiz name too long"] },
    totalMarks: { type: Number, required: [true, "Total marks are required"], min: [1, "Total marks must be positive"] },
    obtainedMarks: { type: Number, required: [true, "Obtained marks are required"], min: [0, "Obtained marks cannot be negative"] },
    date: { type: Date, default: Date.now, index: true },
    remarks: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

quizSchema.index({ quizName: "text" });
quizSchema.index({ studentId: 1, quizName: 1 });
quizSchema.index({ studentId: 1, date: -1 });
quizSchema.index({ subject: 1, class: 1 });

export default mongoose.model<IQuiz>("Quiz", quizSchema);
