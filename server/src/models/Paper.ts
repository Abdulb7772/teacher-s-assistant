import mongoose, { Schema, Document } from "mongoose";

export interface IPaper extends Document {
  termId: mongoose.Types.ObjectId;
  title: string;
  subject?: string;
  class?: string;
  fileUrl: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paperSchema = new Schema<IPaper>(
  {
    termId: { type: mongoose.Schema.Types.ObjectId, ref: "Term", required: true, index: true },
    title: { type: String, required: [true, "Paper title is required"], trim: true, maxlength: [200, "Title too long"] },
    subject: { type: String, trim: true, index: true },
    class: { type: String, trim: true, index: true },
    fileUrl: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPaper>("Paper", paperSchema);
