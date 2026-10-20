import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import Term from "../models/Term";
import Paper from "../models/Paper";
import ExamMark from "../models/ExamMark";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

const cloudName = (): string => process.env.CLOUDINARY_CLOUD_NAME || "aq49gwvn";

const configureCloudinary = (): void => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

const deliveryUrlFor = (publicId: string, resourceType: string, fallback: string): string => {
  if (!publicId || !process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME) return fallback;
  configureCloudinary();
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type: "upload",
    secure: true,
    sign_url: true,
  });
};

// Uploads use the unsigned preset from the browser. Destroying assets requires
// API credentials; without them the app record is removed but the asset stays.
const destroyCloudinaryAsset = async (publicId: string, resourceType: string): Promise<void> => {
  if (!publicId) return;

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiKey || !apiSecret) {
    console.warn(`[Cloudinary] No API key/secret set; left asset ${publicId} in Cloudinary`);
    return;
  }

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName()}/${resourceType}/destroy`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ public_id: publicId }),
    });
    if (!response.ok) {
      console.error(`[Cloudinary] Failed to delete ${publicId}: ${await response.text()}`);
    }
  } catch (error) {
    console.error(`[Cloudinary] Failed to delete ${publicId}:`, error);
  }
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

export const updateTerm = asyncHandler(async (req: Request, res: Response) => {
  const term = await Term.findById(req.params.id);
  if (!term) throw new ApiError(404, "Term not found");

  term.name = String(req.body.name).trim();
  term.startDate = req.body.startDate || null;
  term.endDate = req.body.endDate || null;
  await term.save();

  res.json({ success: true, message: "Term updated", data: term });
});

export const deleteTerm = asyncHandler(async (req: Request, res: Response) => {
  const term = await Term.findById(req.params.id);
  if (!term) throw new ApiError(404, "Term not found");

  const papers = await Paper.find({ termId: term._id }, "publicId resourceType").lean();
  await Promise.allSettled(papers.map((paper) => destroyCloudinaryAsset(paper.publicId, paper.resourceType)));

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
  const papersWithDeliveryUrls = papers.map((paper) => ({
    ...paper,
    fileUrl: deliveryUrlFor(paper.publicId, paper.resourceType, paper.fileUrl),
  }));
  res.json({ success: true, data: papersWithDeliveryUrls });
});

export const uploadPaper = asyncHandler(async (req: Request, res: Response) => {
  const term = await Term.findById(req.body.termId);
  if (!term) throw new ApiError(404, "Term not found");

  const paper = await Paper.create({
    termId: term._id,
    title: String(req.body.title).trim(),
    subject: req.body.subject || undefined,
    class: req.body.class || undefined,
    fileUrl: req.body.fileUrl,
    publicId: req.body.publicId,
    resourceType: req.body.resourceType || "image",
    pages: Number(req.body.pages) || 1,
    originalName: req.body.originalName,
    mimeType: req.body.mimeType,
    size: req.body.size,
    uploadedBy: req.user?.name,
  });

  res.status(201).json({ success: true, message: "Paper uploaded", data: paper });
});

export const deletePaper = asyncHandler(async (req: Request, res: Response) => {
  const paper = await Paper.findByIdAndDelete(req.params.id);
  if (!paper) throw new ApiError(404, "Paper not found");
  await destroyCloudinaryAsset(paper.publicId, paper.resourceType);
  res.json({ success: true, message: "Paper deleted" });
});
