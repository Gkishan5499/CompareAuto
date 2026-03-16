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
import verifyAdmin from "../middleware/verifyAdmin";
import requirePermission from "../middleware/requirePermission";

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
router.post("/bulk", verifyAdmin, requirePermission("models"), bulkCreateCarModels);

// Admin routes
router.post("/", verifyAdmin, requirePermission("models"), createCarModel);
router.put("/:id", verifyAdmin, requirePermission("models"), updateCarModel);
router.delete("/:id", verifyAdmin, requirePermission("models"), deleteCarModel);

export default router;
