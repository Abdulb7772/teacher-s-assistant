import { Router } from "express";
import { protect } from "../middleware/auth";
import validate from "../middleware/validate";
import { paperUpload } from "../middleware/upload";
import { paperValidators, paperIdParam } from "../validators/paperValidators";
import { getPapers, uploadPaper, deletePaper } from "../controllers/paperController";

const router = Router();

router.get("/", protect, getPapers);

router.post(
  "/",
  protect,
  paperUpload.single("file"),
  paperValidators,
  validate,
  uploadPaper
);

router.delete("/:id", protect, paperIdParam, validate, deletePaper);

export default router;
