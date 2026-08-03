import { Router } from "express";
import { publicCourseOutline, publicStudents, publicStudent } from "../controllers/publicController";

const router = Router();

router.get("/course-outline", publicCourseOutline);
router.get("/students", publicStudents);
router.get("/student/:id", publicStudent);

export default router;
