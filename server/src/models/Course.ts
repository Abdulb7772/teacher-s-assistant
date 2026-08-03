import mongoose, { Schema, Document } from "mongoose";

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export type CourseStatus = "pending" | "completed";

export interface ICourse extends Document {
  month: string;
  week: number;
  lectureNumber: number;
  subject?: string;
  class?: string;
  title: string;
  description: string;
  learningOutcomes: string[];
  duration: string;
  status: CourseStatus;
  completionDate: Date | null;
  notes: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    month: { type: String, enum: MONTHS, required: [true, "Month is required"], index: true },
    week: { type: Number, enum: [1, 2, 3, 4, 5], required: [true, "Week is required"] },
    lectureNumber: { type: Number, required: [true, "Lecture number is required"], min: 1 },
    subject: { type: String, trim: true, index: true },
    class: { type: String, trim: true, index: true },
    title: { type: String, required: [true, "Topic title is required"], trim: true, maxlength: [200, "Title too long"] },
    description: { type: String, required: [true, "Description is required"], trim: true },
    learningOutcomes: { type: [String], default: [] },
    duration: { type: String, default: "1 hour" },
    status: { type: String, enum: ["pending", "completed"], default: "pending", index: true },
    completionDate: { type: Date, default: null },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

courseSchema.index({ title: "text", description: "text" });
courseSchema.index({ lectureNumber: 1 });
courseSchema.index({ status: 1, lectureNumber: 1 });
courseSchema.index({ month: 1, status: 1 });
courseSchema.index({ subject: 1, class: 1 });

export default mongoose.model<ICourse>("Course", courseSchema);
