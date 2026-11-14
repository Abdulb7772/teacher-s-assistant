import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth";
import validate from "../middleware/validate";
import {
  examMarkValidators,
  examColumnValidators,
  examColumnUpdateValidators,
  examColumnDeleteValidators,
  absentMarkValidators,
  examMarkIdParam,
} from "../validators/examMarkValidators";
import {
  getExamMarks,
  saveExamMark,
  createExamSubjectColumn,
  updateExamMark,
  updateExamSubjectColumn,
  deleteExamSubjectColumn,
  markAbsent,
} from "../controllers/examMarkController";

const router = Router();

router
  .route("/")
  .get(protect, getExamMarks)
  .post(protect, adminOnly, examMarkValidators, validate, saveExamMark);

router.post("/column", protect, adminOnly, examColumnValidators, validate, createExamSubjectColumn);
router.post("/absent", protect, adminOnly, absentMarkValidators, validate, markAbsent);
router.put("/column", protect, adminOnly, examColumnUpdateValidators, validate, updateExamSubjectColumn);
router.delete("/column", protect, adminOnly, examColumnDeleteValidators, validate, deleteExamSubjectColumn);

router.put("/:id", protect, adminOnly, examMarkIdParam, examMarkValidators, validate, updateExamMark);

export default router;
