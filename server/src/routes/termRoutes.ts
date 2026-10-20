import { Router } from "express";
import { protect } from "../middleware/auth";
import validate from "../middleware/validate";
import { termValidators, termIdParam } from "../validators/paperValidators";
import { getTerms, createTerm, updateTerm, deleteTerm } from "../controllers/paperController";

const router = Router();

router
  .route("/")
  .get(protect, getTerms)
  .post(protect, termValidators, validate, createTerm);

router.put("/:id", protect, termIdParam, termValidators, validate, updateTerm);
router.delete("/:id", protect, termIdParam, validate, deleteTerm);

export default router;
