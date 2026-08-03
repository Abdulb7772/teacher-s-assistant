import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth";
import validate from "../middleware/validate";
import { classValidators, metaIdParam } from "../validators/metaValidators";
import { getClasses, createClass, deleteClass } from "../controllers/classController";

const router = Router();

router.get("/", getClasses);
router.post("/", protect, adminOnly, classValidators, validate, createClass);
router.delete("/:id", protect, adminOnly, metaIdParam, validate, deleteClass);

export default router;
