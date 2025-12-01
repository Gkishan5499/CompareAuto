import { Router } from "express";
import {
  getAllCarModels,
  getCarModelById,
  getCarModelBySlug,
  getCarModelsByBrand,
  getCarModelsByBodyType,
  getCarModelsByFuelType,
  getPopularCarModels,
  getNewCarModels,
  getUpcomingCarModels,
  createCarModel,
  updateCarModel,
  deleteCarModel
  , bulkCreateCarModels
} from "../controllers/carModel.controller";

const router = Router();

// Public routes
router.get("/", getAllCarModels);
router.get("/popular", getPopularCarModels);
router.get("/new", getNewCarModels);
router.get("/upcoming", getUpcomingCarModels);
router.get("/brand/:brandId", getCarModelsByBrand);
router.get("/body-type/:bodyType", getCarModelsByBodyType);
router.get("/fuel-type/:fuelType", getCarModelsByFuelType);
router.get("/slug/:slug", getCarModelBySlug);
router.get("/:id", getCarModelById);
router.post("/bulk", bulkCreateCarModels);

// Admin routes
router.post("/", createCarModel);
router.put("/:id", updateCarModel);
router.delete("/:id", deleteCarModel);

export default router;
