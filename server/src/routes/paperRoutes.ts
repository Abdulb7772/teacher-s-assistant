import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/auth";
import validate from "../middleware/validate";
import { paperValidators, paperIdParam } from "../validators/paperValidators";
import { getPapers, uploadPaper, uploadPaperWithFile, streamPaperFile, deletePaper } from "../controllers/paperController";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.get("/", protect, getPapers);
router.get("/:id/file", protect, streamPaperFile);

router.post("/upload", protect, upload.single("file"), uploadPaperWithFile);
router.post("/", protect, paperValidators, validate, uploadPaper);

router.delete("/:id", protect, paperIdParam, validate, deletePaper);

export default router;
