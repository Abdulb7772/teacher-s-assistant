import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth";
import validate from "../middleware/validate";
import { createUserValidators, updateUserValidators, userIdParam } from "../validators/userValidators";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/userController";

const router = Router();

router.use(protect, adminOnly);
router.get("/", getUsers);
router.post("/", createUserValidators, validate, createUser);
router.put("/:id", updateUserValidators, validate, updateUser);
router.delete("/:id", userIdParam, validate, deleteUser);

export default router;
