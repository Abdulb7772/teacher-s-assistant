import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth";
import validate from "../middleware/validate";
import { studentValidators, studentIdParam } from "../validators/studentValidators";
import { getStudents, createStudent, updateStudent, deleteStudent } from "../controllers/studentController";

const router = Router();

router
  .route("/")
  .get(protect, getStudents)
  .post(protect, adminOnly, studentValidators, validate, createStudent);

router
  .route("/:id")
  .put(protect, adminOnly, studentIdParam, studentValidators, validate, updateStudent)
  .delete(protect, adminOnly, studentIdParam, validate, deleteStudent);

export default router;
