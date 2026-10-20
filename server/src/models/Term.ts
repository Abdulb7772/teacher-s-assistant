import mongoose, { Schema, Document } from "mongoose";

export interface ITerm extends Document {
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const termSchema = new Schema<ITerm>(
  {
    name: {
      type: String,
      required: [true, "Term name is required"],
      unique: true,
      trim: true,
      maxlength: [80, "Term name too long"],
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<ITerm>("Term", termSchema);
