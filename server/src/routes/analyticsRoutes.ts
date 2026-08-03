import { Router } from "express";
import { protect } from "../middleware/auth";
import { analytics } from "../controllers/analyticsController";

const router = Router();

router.get("/", protect, analytics);

export default router;
