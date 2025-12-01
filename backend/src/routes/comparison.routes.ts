import { Router } from "express";
import {
  getAllComparisons,
  getComparisonById,
  createComparison,
  updateComparison,
  deleteComparison
} from "../controllers/comparison.controller";

const router = Router();

router.get("/", getAllComparisons);
router.get("/:id", getComparisonById);
router.post("/", createComparison);
router.put("/:id", updateComparison);
router.delete("/:id", deleteComparison);

export default router;
