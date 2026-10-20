import { Router } from "express";
import { protect } from "../middleware/auth";
import validate from "../middleware/validate";
import {
  examMarkValidators,
  examColumnValidators,
  examColumnUpdateValidators,
  examColumnDeleteValidators,
  examMarkIdParam,
} from "../validators/examMarkValidators";
import {
  getExamMarks,
  saveExamMark,
  createExamSubjectColumn,
  updateExamMark,
  updateExamSubjectColumn,
  deleteExamSubjectColumn,
} from "../controllers/examMarkController";

const router = Router();

router
  .route("/")
  .get(protect, getExamMarks)
  .post(protect, examMarkValidators, validate, saveExamMark);

router.post("/column", protect, examColumnValidators, validate, createExamSubjectColumn);
router.put("/column", protect, examColumnUpdateValidators, validate, updateExamSubjectColumn);
router.delete("/column", protect, examColumnDeleteValidators, validate, deleteExamSubjectColumn);

router.put("/:id", protect, examMarkIdParam, examMarkValidators, validate, updateExamMark);

export default router;
