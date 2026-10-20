import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import Term from "../models/Term";
import Paper from "../models/Paper";
import ExamMark from "../models/ExamMark";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { UPLOAD_DIR } from "../middleware/upload";

const removeStoredFile = (fileUrl: string): void => {
  // fileUrl is always `/uploads/<stored-name>`; basename prevents path traversal.
  fs.unlink(path.join(UPLOAD_DIR, path.basename(fileUrl)), () => undefined);
};

export const getTerms = asyncHandler(async (_req: Request, res: Response) => {
  const terms = await Term.find().sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: terms });
});

export const createTerm = asyncHandler(async (req: Request, res: Response) => {
  const term = await Term.create({
    name: String(req.body.name).trim(),
    startDate: req.body.startDate || null,
    endDate: req.body.endDate || null,
  });
  res.status(201).json({ success: true, message: "Term created", data: term });
});

export const deleteTerm = asyncHandler(async (req: Request, res: Response) => {
  const term = await Term.findById(req.params.id);
  if (!term) throw new ApiError(404, "Term not found");

  const papers = await Paper.find({ termId: term._id }, "fileUrl").lean();
  papers.forEach((paper) => removeStoredFile(paper.fileUrl));

  await Promise.all([
    Paper.deleteMany({ termId: term._id }),
    ExamMark.deleteMany({ termId: term._id }),
    term.deleteOne(),
  ]);
  res.json({ success: true, message: "Term deleted" });
});

export const getPapers = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.termId) filter.termId = req.query.termId;
  if (req.query.search) filter.title = { $regex: req.query.search, $options: "i" };

  const papers = await Paper.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: papers });
});

export const uploadPaper = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new ApiError(400, "Please choose a file to upload");

  const term = await Term.findById(req.body.termId);
  if (!term) {
    removeStoredFile(req.file.filename);
    throw new ApiError(404, "Term not found");
  }

  const paper = await Paper.create({
    termId: term._id,
    title: String(req.body.title).trim(),
    subject: req.body.subject || undefined,
    class: req.body.class || undefined,
    fileUrl: `/uploads/${req.file.filename}`,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    uploadedBy: req.user?.name,
  });

  res.status(201).json({ success: true, message: "Paper uploaded", data: paper });
});

export const deletePaper = asyncHandler(async (req: Request, res: Response) => {
  const paper = await Paper.findByIdAndDelete(req.params.id);
  if (!paper) throw new ApiError(404, "Paper not found");
  removeStoredFile(paper.fileUrl);
  res.json({ success: true, message: "Paper deleted" });
});
