import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  name: string;
  rollNumber?: string;
  registrationNumber?: string;
  email?: string;
  class?: string;
  subject?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentPerformance extends IStudent {
  quizCount: number;
  average: number;
  percentage: number;
  grade: string;
}

const studentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: [true, "Full name is required"], trim: true, maxlength: [80, "Name too long"] },
    rollNumber: { type: String, trim: true, unique: true, sparse: true, index: true },
    registrationNumber: { type: String, trim: true, unique: true, sparse: true, index: true },
    email: { type: String, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"] },
    class: { type: String, trim: true, index: true },
    subject: { type: String, trim: true, index: true },
  },
  { timestamps: true }
);

studentSchema.index({ name: "text", rollNumber: "text", registrationNumber: "text", email: "text" });

export default mongoose.model<IStudent>("Student", studentSchema);
