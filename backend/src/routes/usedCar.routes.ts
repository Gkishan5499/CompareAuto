import { Router } from "express";
import {
  getAllUsedCars,
  getUsedCarById,
  getUsedCarsByCity,
  createUsedCar,
  updateUsedCar,
  deleteUsedCar
} from "../controllers/usedCar.controller";

const router = Router();

router.get("/", getAllUsedCars);
router.get("/:id", getUsedCarById);
router.get("/city/:city", getUsedCarsByCity);
router.post("/", createUsedCar);
router.put("/:id", updateUsedCar);
router.delete("/:id", deleteUsedCar);

export default router;
