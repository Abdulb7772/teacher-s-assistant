import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth";
import validate from "../middleware/validate";
import { classValidators, importStudentsValidators, metaIdParam } from "../validators/metaValidators";
import { getClasses, createClass, updateClass, importStudents, deleteClass } from "../controllers/classController";

const router = Router();

router.get("/", getClasses);
router.post("/", protect, adminOnly, classValidators, validate, createClass);
router.put("/:id", protect, adminOnly, metaIdParam, classValidators, validate, updateClass);
router.post("/:id/import-students", protect, adminOnly, metaIdParam, importStudentsValidators, validate, importStudents);
router.delete("/:id", protect, adminOnly, metaIdParam, validate, deleteClass);

export default router;
