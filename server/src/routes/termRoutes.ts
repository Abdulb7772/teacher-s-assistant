import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth";
import validate from "../middleware/validate";
import { termValidators, termIdParam } from "../validators/paperValidators";
import { getTerms, createTerm, updateTerm, deleteTerm } from "../controllers/paperController";

const router = Router();

router
  .route("/")
  .get(protect, getTerms)
  .post(protect, adminOnly, termValidators, validate, createTerm);

router.put("/:id", protect, adminOnly, termIdParam, termValidators, validate, updateTerm);
router.delete("/:id", protect, adminOnly, termIdParam, validate, deleteTerm);

export default router;
