import fs from "fs";
import path from "path";
import multer from "multer";
import ApiError from "../utils/ApiError";

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx", ".ppt", ".pptx", ".jpg", ".jpeg", ".png", ".webp"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

export const paperUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new ApiError(400, "Unsupported file type. Upload a PDF, Word, PowerPoint or image file."));
    }
    cb(null, true);
  },
});
