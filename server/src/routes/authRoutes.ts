import { Router } from "express";
import { protect } from "../middleware/auth";
import validate from "../middleware/validate";
import { loginValidators, updateProfileValidators, updatePasswordValidators } from "../validators/authValidators";
import { login, logout, profile, updateProfile, updatePassword } from "../controllers/authController";

const router = Router();

router.post("/login", loginValidators, validate, login);
router.post("/logout", logout);
router.get("/profile", protect, profile);
router.patch("/profile", protect, updateProfileValidators, validate, updateProfile);
router.patch("/password", protect, updatePasswordValidators, validate, updatePassword);

export default router;
