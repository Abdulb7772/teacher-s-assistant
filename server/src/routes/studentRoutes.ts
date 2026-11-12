import { Router } from "express";
import multer from "multer";
import { protect, adminOnly } from "../middleware/auth";
import validate from "../middleware/validate";
import { studentValidators, studentIdParam } from "../validators/studentValidators";
import { getStudents, createStudent, updateStudent, deleteStudent, uploadStudentPhotoHandler } from "../controllers/studentController";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, file.mimetype.startsWith("image/")),
});

router
  .route("/")
  .get(protect, getStudents)
  .post(protect, adminOnly, studentValidators, validate, createStudent);

router
  .route("/:id")
  .put(protect, studentIdParam, studentValidators, validate, updateStudent)
  .delete(protect, adminOnly, studentIdParam, validate, deleteStudent);

router.post("/:id/photo", protect, studentIdParam, validate, upload.single("photo"), uploadStudentPhotoHandler);

export default router;
