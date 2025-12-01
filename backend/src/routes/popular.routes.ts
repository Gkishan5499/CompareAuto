import { Router } from "express";
import {
  getMostSearchedCars,
  getPopularBrands,
  getTrendingComparisons,
  getLatestLaunches,
  getElectricCars,
} from "../controllers/popular.controller";

const router = Router();

router.get("/most-searched", getMostSearchedCars);
router.get("/brands", getPopularBrands);
router.get("/comparisons", getTrendingComparisons);
router.get("/latest-launches", getLatestLaunches);
router.get("/electric-cars", getElectricCars);

export default router;

