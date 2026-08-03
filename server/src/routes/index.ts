import { Router } from "express";
import authRoutes from "./authRoutes";
import courseRoutes from "./courseRoutes";
import studentRoutes from "./studentRoutes";
import quizRoutes from "./quizRoutes";
import analyticsRoutes from "./analyticsRoutes";
import publicRoutes from "./publicRoutes";
import userRoutes from "./userRoutes";
import subjectRoutes from "./subjectRoutes";
import classRoutes from "./classRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/course", courseRoutes);
router.use("/students", studentRoutes);
router.use("/quizzes", quizRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/public", publicRoutes);
router.use("/users", userRoutes);
router.use("/subjects", subjectRoutes);
router.use("/classes", classRoutes);

export default router;
