import mongoose, { Schema, Document } from "mongoose";

export interface IExamMark extends Document {
  termId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  class?: string;
  subject: string;
  totalMarks: number;
  obtainedMarks: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const examMarkSchema = new Schema<IExamMark>(
  {
    termId: { type: mongoose.Schema.Types.ObjectId, ref: "Term", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    class: { type: String, trim: true, index: true },
    subject: { type: String, required: [true, "Subject is required"], trim: true, maxlength: [60, "Subject too long"] },
    totalMarks: { type: Number, required: true, min: [1, "Total marks must be positive"] },
    obtainedMarks: { type: Number, default: null, min: [0, "Obtained marks cannot be negative"] },
  },
  { timestamps: true }
);

examMarkSchema.index({ termId: 1, studentId: 1, subject: 1 }, { unique: true });
examMarkSchema.index({ termId: 1, class: 1, subject: 1 });

export default mongoose.model<IExamMark>("ExamMark", examMarkSchema);
