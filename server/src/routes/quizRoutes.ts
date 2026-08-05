import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth";
import validate from "../middleware/validate";
import { quizValidators, quizColumnValidators, quizColumnDeleteValidators, quizIdParam } from "../validators/quizValidators";
import { getQuizzes, createQuiz, createQuizColumn, updateQuiz, deleteQuiz, deleteQuizColumn } from "../controllers/quizController";

const router = Router();

router
  .route("/")
  .get(protect, getQuizzes)
  .post(protect, adminOnly, quizValidators, validate, createQuiz);

router
  .route("/bulk")
  .post(protect, adminOnly, quizColumnValidators, validate, createQuizColumn);

router
  .route("/column")
  .delete(protect, adminOnly, quizColumnDeleteValidators, validate, deleteQuizColumn);

router
  .route("/:id")
  .put(protect, adminOnly, quizIdParam, quizValidators, validate, updateQuiz)
  .delete(protect, adminOnly, quizIdParam, validate, deleteQuiz);

export default router;
