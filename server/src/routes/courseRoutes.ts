import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth";
import validate from "../middleware/validate";
import { courseValidators, courseIdParam, statusValidator } from "../validators/courseValidators";
import { getCourses, createCourse, updateCourse, deleteCourse, updateStatus } from "../controllers/courseController";

const router = Router();

router
  .route("/")
  .get(protect, getCourses)
  .post(protect, adminOnly, courseValidators, validate, createCourse);

router
  .route("/:id")
  .put(protect, adminOnly, courseIdParam, courseValidators, validate, updateCourse)
  .delete(protect, adminOnly, courseIdParam, validate, deleteCourse);

// Status toggling is open to any authenticated user (admin + employee);
// create/edit/delete remain admin-only.
router.patch("/:id/status", protect, courseIdParam, statusValidator, validate, updateStatus);

export default router;
