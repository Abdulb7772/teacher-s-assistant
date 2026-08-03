import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth";
import validate from "../middleware/validate";
import { createUserValidators } from "../validators/userValidators";
import { getUsers, createUser } from "../controllers/userController";

const router = Router();

router.use(protect, adminOnly);
router.get("/", getUsers);
router.post("/", createUserValidators, validate, createUser);

export default router;
