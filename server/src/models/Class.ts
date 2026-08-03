import mongoose, { Schema, Document } from "mongoose";

export interface ISchoolClass extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<ISchoolClass>(
  {
    name: {
      type: String,
      required: [true, "Class name is required"],
      unique: true,
      trim: true,
      maxlength: [30, "Class name too long"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISchoolClass>("SchoolClass", classSchema);
