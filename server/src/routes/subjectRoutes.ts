import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth";
import validate from "../middleware/validate";
import { subjectValidators, metaIdParam } from "../validators/metaValidators";
import { getSubjects, createSubject, deleteSubject } from "../controllers/subjectController";

const router = Router();

router.get("/", getSubjects);
router.post("/", protect, adminOnly, subjectValidators, validate, createSubject);
router.delete("/:id", protect, adminOnly, metaIdParam, validate, deleteSubject);

export default router;
