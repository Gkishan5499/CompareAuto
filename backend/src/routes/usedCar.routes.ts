import { Router } from "express";
import {
  getAllUsedCars,
  getUsedCarById,
  getUsedCarsByCity,
  createUsedCar,
  updateUsedCar,
  deleteUsedCar
} from "../controllers/usedCar.controller";
import verifyAdmin from "../middleware/verifyAdmin";
import requirePermission from "../middleware/requirePermission";

const router = Router();

router.get("/", getAllUsedCars);
router.get("/:id", getUsedCarById);
router.get("/city/:city", getUsedCarsByCity);
router.post("/", verifyAdmin, requirePermission("usedCars"), createUsedCar);
router.put("/:id", verifyAdmin, requirePermission("usedCars"), updateUsedCar);
router.delete("/:id", verifyAdmin, requirePermission("usedCars"), deleteUsedCar);

export default router;
