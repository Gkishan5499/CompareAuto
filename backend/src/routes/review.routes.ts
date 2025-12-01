import { Router } from "express";
import {
  getAllReviews,
  getReviewById,
  getReviewsByModel,
  createReview,
  updateReview,
  deleteReview
} from "../controllers/review.controller";

const router = Router();

router.get("/", getAllReviews);
router.get("/:id", getReviewById);
router.get("/model/:modelSlug", getReviewsByModel);
router.post("/", createReview);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;
