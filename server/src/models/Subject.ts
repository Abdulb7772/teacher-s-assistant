import mongoose, { Schema, Document } from "mongoose";

export interface ISubject extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const subjectSchema = new Schema<ISubject>(
  {
    name: {
      type: String,
      required: [true, "Subject name is required"],
      unique: true,
      trim: true,
      maxlength: [60, "Subject name too long"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISubject>("Subject", subjectSchema);
